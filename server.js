const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;

// Repo root is parent of qa-portal
const REPO_ROOT = path.resolve(__dirname, '..');

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// List directories in repo root that look like HU* or EN* (or any dir containing .md files)
app.get('/api/repo-files', async (req, res) => {
  try {
    const entries = await fs.readdir(REPO_ROOT, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(d => d.name);

    const results = [];
    for (const d of dirs) {
      const full = path.join(REPO_ROOT, d);
      // check if folder name starts with HU or EN (case-insensitive) OR contains markdown files
      const isHUEN = /^HU|^EN/i.test(d);
      const files = [];
      try {
        const sub = await fs.readdir(full, { withFileTypes: true });
        for (const s of sub) {
          if (s.isFile()) files.push(s.name);
        }
      } catch (e) {
        // ignore
      }
      if (isHUEN || files.some(f => f.endsWith('.md') || f.endsWith('.ts') || f.endsWith('.spec.ts'))) {
        results.push({
          name: d,
          path: d,
          files: files
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to list repo' });
  }
});

// Endpoint para sincronizar HU/EN desde la raíz del repo hacia src/assets
app.get('/api/sync', async (req, res) => {
  try {
    const ASSETS_DIR = path.join(__dirname, 'src', 'assets');
    const INDEX_DIR = path.join(ASSETS_DIR, 'repo-files');
    if (!fsSync.existsSync(ASSETS_DIR)) fsSync.mkdirSync(ASSETS_DIR, { recursive: true });
    if (!fsSync.existsSync(INDEX_DIR)) fsSync.mkdirSync(INDEX_DIR, { recursive: true });

    const entries = await fs.readdir(REPO_ROOT, { withFileTypes: true });
    const result = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!/^(HU|EN)/i.test(entry.name)) continue;

      const folderPath = path.join(REPO_ROOT, entry.name);
      let files = [];
      try {
        const sub = await fs.readdir(folderPath, { withFileTypes: true });
        files = sub.filter(s => s.isFile()).map(s => s.name).filter(n => ['.md', '.ts', '.txt', '.json'].includes(path.extname(n).toLowerCase()));
      } catch (e) {
        files = [];
      }

      if (files.length === 0) continue;

      result.push({ name: entry.name, path: entry.name, files });

      // copiar archivos a assets/<HU>/
      const destDir = path.join(ASSETS_DIR, entry.name);
      if (!fsSync.existsSync(destDir)) fsSync.mkdirSync(destDir, { recursive: true });
      for (const f of files) {
        try {
          const src = path.join(folderPath, f);
          const dst = path.join(destDir, f);
          fsSync.copyFileSync(src, dst);
        } catch (e) {
          console.warn('copy fail', entry.name, f, e.message);
        }
      }
    }

    // escribir índice en src/assets/repo-files/repo-files.json
    const indexPath = path.join(INDEX_DIR, 'repo-files.json');
    fsSync.writeFileSync(indexPath, JSON.stringify(result, null, 2), 'utf8');

    res.json({ ok: true, count: result.length, index: result });
  } catch (err) {
    console.error('sync error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Serve file content by relative path inside repo
app.get('/api/repo-files/content', async (req, res) => {
  const rel = req.query.path;
  const folder = req.query.folder; // optional
  if (!rel && !folder) {
    return res.status(400).json({ error: 'path or folder+file required' });
  }

  let target;
  if (folder && rel) {
    target = path.join(REPO_ROOT, folder, rel);
  } else if (rel) {
    target = path.join(REPO_ROOT, rel);
  }

  const resolved = path.resolve(target);
  if (!resolved.startsWith(REPO_ROOT)) {
    return res.status(400).json({ error: 'invalid path' });
  }

  try {
    const content = await fs.readFile(resolved, 'utf8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  } catch (err) {
    res.status(404).json({ error: 'file not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Repo-files server listening on port ${PORT}. Repo root: ${REPO_ROOT}`);
});
