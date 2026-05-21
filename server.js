const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;

// Repo root is parent of qa-portal
const REPO_ROOT = path.resolve(__dirname, '..');

app.use(express.text({ type: '*/*', limit: '10mb' }));
app.use(express.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
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

// Endpoint para sincronizar HU/EN.
// 1) Escanea la raíz del repo en busca de carpetas HU*/EN* y las copia a assets.
// 2) Escanea también src/assets/repo-files/ para no perder carpetas ya existentes.
// Merge ambos resultados y escribe repo-files.json.
app.get('/api/sync', async (req, res) => {
  try {
    const ASSETS_DIR = path.join(__dirname, 'src', 'assets');
    const INDEX_DIR = path.join(ASSETS_DIR, 'repo-files');
    if (!fsSync.existsSync(ASSETS_DIR)) fsSync.mkdirSync(ASSETS_DIR, { recursive: true });
    if (!fsSync.existsSync(INDEX_DIR)) fsSync.mkdirSync(INDEX_DIR, { recursive: true });

    const ALLOWED_EXT = ['.md', '.ts', '.txt', '.json'];
    const merged = new Map(); // name -> { name, path, files }

    // --- Paso 1: Escanear raíz del repo ---
    try {
      const entries = await fs.readdir(REPO_ROOT, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (!/^(HU|EN)/i.test(entry.name)) continue;
        const folderPath = path.join(REPO_ROOT, entry.name);
        let files = [];
        try {
          const sub = await fs.readdir(folderPath, { withFileTypes: true });
          files = sub.filter(s => s.isFile()).map(s => s.name)
            .filter(n => ALLOWED_EXT.includes(path.extname(n).toLowerCase()));
        } catch (e) { files = []; }
        if (files.length === 0) continue;
        merged.set(entry.name, { name: entry.name, path: entry.name, files });
        // copiar archivos a assets/repo-files/<HU>/
        const destDir = path.join(INDEX_DIR, entry.name);
        if (!fsSync.existsSync(destDir)) fsSync.mkdirSync(destDir, { recursive: true });
        for (const f of files) {
          try {
            fsSync.copyFileSync(path.join(folderPath, f), path.join(destDir, f));
          } catch (e) { console.warn('copy fail', entry.name, f, e.message); }
        }
      }
    } catch (e) { console.warn('scan repo root failed', e.message); }

    // --- Paso 2: Escanear carpetas ya existentes en assets/repo-files/ ---
    try {
      const assetEntries = await fs.readdir(INDEX_DIR, { withFileTypes: true });
      for (const entry of assetEntries) {
        if (!entry.isDirectory()) continue;
        if (!/^(HU|EN)/i.test(entry.name)) continue;
        if (merged.has(entry.name)) continue; // ya incluida desde repo root
        const folderPath = path.join(INDEX_DIR, entry.name);
        let files = [];
        try {
          const sub = await fs.readdir(folderPath, { withFileTypes: true });
          files = sub.filter(s => s.isFile()).map(s => s.name)
            .filter(n => ALLOWED_EXT.includes(path.extname(n).toLowerCase()));
        } catch (e) { files = []; }
        if (files.length === 0) continue;
        merged.set(entry.name, { name: entry.name, path: entry.name, files });
      }
    } catch (e) { console.warn('scan assets failed', e.message); }

    const result = Array.from(merged.values());

    // escribir índice en src/assets/repo-files/repo-files.json
    const indexPath = path.join(INDEX_DIR, 'repo-files.json');
    fsSync.writeFileSync(indexPath, JSON.stringify(result, null, 2), 'utf8');

    res.json({ ok: true, count: result.length, index: result });
  } catch (err) {
    console.error('sync error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Escanea src/assets/repo-files/ y devuelve la lista de carpetas HU/EN con sus archivos.
// No depende de repo-files.json: lee el filesystem directamente.
app.get('/api/scan-assets', async (req, res) => {
  try {
    const INDEX_DIR = path.join(__dirname, 'src', 'assets', 'repo-files');
    if (!fsSync.existsSync(INDEX_DIR)) {
      return res.json([]);
    }
    const ALLOWED_EXT = ['.md', '.ts', '.txt'];
    const entries = await fs.readdir(INDEX_DIR, { withFileTypes: true });
    const result = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!/^(HU|EN)/i.test(entry.name)) continue;
      const folderPath = path.join(INDEX_DIR, entry.name);
      let files = [];
      try {
        const sub = await fs.readdir(folderPath, { withFileTypes: true });
        files = sub.filter(s => s.isFile()).map(s => s.name)
          .filter(n => ALLOWED_EXT.includes(path.extname(n).toLowerCase()));
      } catch (e) { files = []; }
      if (files.length === 0) continue;
      result.push({ name: entry.name, path: entry.name, files });
    }
    res.json(result);
  } catch (err) {
    console.error('scan-assets error', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve file content — busca en assets/repo-files/ y también en REPO_ROOT
app.get('/api/repo-files/content', async (req, res) => {
  const rel = req.query.path;
  const folder = req.query.folder;
  if (!rel && !folder) {
    return res.status(400).json({ error: 'path or folder+file required' });
  }

  const INDEX_DIR = path.join(__dirname, 'src', 'assets', 'repo-files');

  // Intentar desde assets/repo-files/ primero
  if (folder && rel) {
    const assetTarget = path.resolve(path.join(INDEX_DIR, folder, rel));
    if (assetTarget.startsWith(path.resolve(INDEX_DIR))) {
      try {
        const content = await fs.readFile(assetTarget, 'utf8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(content);
      } catch (e) { /* fall through to REPO_ROOT */ }
    }
  }

  // Fallback: buscar en REPO_ROOT
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

// Save (overwrite) a file — writes to src/assets/repo-files/<folder>/<file>
app.put('/api/repo-files/content', async (req, res) => {
  const rel = req.query.path;
  const folder = req.query.folder;
  if (!rel || !folder) {
    return res.status(400).json({ error: 'folder and path query params required' });
  }
  const INDEX_DIR = path.join(__dirname, 'src', 'assets', 'repo-files');
  const target = path.resolve(path.join(INDEX_DIR, folder, rel));
  if (!target.startsWith(path.resolve(INDEX_DIR))) {
    return res.status(400).json({ error: 'invalid path' });
  }
  try {
    const content = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    await fs.writeFile(target, content, 'utf8');
    res.json({ ok: true });
  } catch (err) {
    console.error('save error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete a folder under src/assets/repo-files/<folder>
app.delete('/api/repo-files/folder', async (req, res) => {
  const folder = req.query.folder;
  if (!folder) return res.status(400).json({ error: 'folder query param required' });
  try {
    const INDEX_DIR = path.join(__dirname, 'src', 'assets', 'repo-files');
    const sprint = req.query.sprint;
    const target = sprint ? path.resolve(path.join(INDEX_DIR, sprint, folder)) : path.resolve(path.join(INDEX_DIR, folder));
    if (!target.startsWith(path.resolve(INDEX_DIR))) return res.status(400).json({ error: 'invalid path' });
    if (!fsSync.existsSync(target)) return res.status(404).json({ error: 'folder not found' });
    // remove directory recursively
    await fs.rm(target, { recursive: true, force: true });

    // regenerate repo-files.json index
    try {
      const ALLOWED_EXT = ['.md', '.ts', '.txt'];
      const entries = await fs.readdir(INDEX_DIR, { withFileTypes: true });
      const result = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (!/^(HU|EN)/i.test(entry.name)) continue;
        const folderPath = path.join(INDEX_DIR, entry.name);
        let files = [];
        try {
          const sub = await fs.readdir(folderPath, { withFileTypes: true });
          files = sub.filter(s => s.isFile()).map(s => s.name)
            .filter(n => ALLOWED_EXT.includes(path.extname(n).toLowerCase()));
        } catch (e) { files = []; }
        if (files.length === 0) continue;
        result.push({ name: entry.name, path: entry.name, files });
      }
      const indexPath = path.join(INDEX_DIR, 'repo-files.json');
      fsSync.writeFileSync(indexPath, JSON.stringify(result, null, 2), 'utf8');
    } catch (e) {
      console.warn('rebuild index after delete failed', e && e.message ? e.message : e);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('delete folder error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════
// SPRINTS API
// ══════════════════════════════════════════════════════

const SPRINTS_FILE = path.join(__dirname, 'src', 'assets', 'repo-files', 'sprints.json');

async function readSprints() {
  try {
    const data = await fs.readFile(SPRINTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch { return []; }
}

async function writeSprints(sprints) {
  const dir = path.dirname(SPRINTS_FILE);
  if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
  await fs.writeFile(SPRINTS_FILE, JSON.stringify(sprints, null, 2), 'utf8');
}

// List all sprints
app.get('/api/sprints', async (req, res) => {
  try {
    const sprints = await readSprints();
    res.json(sprints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create sprint
app.post('/api/sprints', async (req, res) => {
  try {
    const sprints = await readSprints();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const sprint = {
      id: body.id || `sprint-${Date.now()}`,
      nombre: body.nombre || 'Sprint sin nombre',
      fechaInicio: body.fechaInicio || new Date().toISOString().split('T')[0],
      fechaFin: body.fechaFin || '',
      estado: body.estado || 'activo',
      hus: body.hus || []
    };
    sprints.push(sprint);
    await writeSprints(sprints);

    // Create sprint folder
    const sprintDir = path.join(__dirname, 'src', 'assets', 'repo-files', sprint.id);
    if (!fsSync.existsSync(sprintDir)) fsSync.mkdirSync(sprintDir, { recursive: true });

    res.status(201).json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update sprint
app.put('/api/sprints/:id', async (req, res) => {
  try {
    const sprints = await readSprints();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const idx = sprints.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'sprint not found' });
    sprints[idx] = { ...sprints[idx], ...body, id: req.params.id };
    await writeSprints(sprints);
    res.json(sprints[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add HU to sprint
app.post('/api/sprints/:id/hus', async (req, res) => {
  try {
    const sprints = await readSprints();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const idx = sprints.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'sprint not found' });
    const huName = body.huName;
    if (!huName) return res.status(400).json({ error: 'huName required' });
    if (!sprints[idx].hus.includes(huName)) {
      sprints[idx].hus.push(huName);
    }
    await writeSprints(sprints);
    // Nota: la carpeta y artefactos en repo-files son responsabilidad exclusiva del agente QA.
    // Aquí solo se persiste el registro en sprints.json.
    res.json(sprints[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove HU from sprint
app.delete('/api/sprints/:id/hus/:huName', async (req, res) => {
  try {
    const sprints = await readSprints();
    const idx = sprints.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'sprint not found' });
    // Decode and normalize to safely match regardless of URL encoding or case differences
    const huToRemove = decodeURIComponent(req.params.huName).trim();
    sprints[idx].hus = sprints[idx].hus.filter(h => decodeURIComponent(h).trim() !== huToRemove);
    await writeSprints(sprints);
    res.json(sprints[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get HU folders for a sprint
app.get('/api/sprints/:id/hus', async (req, res) => {
  try {
    const sprintDir = path.join(__dirname, 'src', 'assets', 'repo-files', req.params.id);
    if (!fsSync.existsSync(sprintDir)) return res.json([]);
    const ALLOWED_EXT = ['.md', '.ts', '.txt', '.json'];
    const entries = await fs.readdir(sprintDir, { withFileTypes: true });
    const result = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const folderPath = path.join(sprintDir, entry.name);
      let files = [];
      try {
        const sub = await fs.readdir(folderPath, { withFileTypes: true });
        files = sub.filter(s => s.isFile()).map(s => s.name)
          .filter(n => ALLOWED_EXT.includes(path.extname(n).toLowerCase()));
      } catch (e) { files = []; }
      result.push({ name: entry.name, path: entry.name, files, sprintId: req.params.id });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Historial endpoints removed (feature deprecated)

// ══════════════════════════════════════════════════════
// METRICS API
// ══════════════════════════════════════════════════════

app.get('/api/metrics', async (req, res) => {
  try {
    const sprints = await readSprints();
    const INDEX_DIR = path.join(__dirname, 'src', 'assets', 'repo-files');
    let totalCPsAuto = 0, totalCPsManual = 0, totalHUs = 0;

    for (const sprint of sprints) {
      const sprintDir = path.join(INDEX_DIR, sprint.id);
      if (!fsSync.existsSync(sprintDir)) continue;
      const entries = await fs.readdir(sprintDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name === 'historial') continue;
        totalHUs++;
        const huDir = path.join(sprintDir, entry.name);
        // Count CPs in automatizables
        try {
          const autoMd = await fs.readFile(path.join(huDir, 'casos_automatizables.md'), 'utf8');
          const matches = autoMd.match(/CP-A\d+/g);
          if (matches) totalCPsAuto += new Set(matches).size;
        } catch {}
        // Count CPs in manuales
        try {
          const manMd = await fs.readFile(path.join(huDir, 'casos_manuales.md'), 'utf8');
          const matches = manMd.match(/CP-M\d+/g);
          if (matches) totalCPsManual += new Set(matches).size;
        } catch {}
      }
    }

    // Also scan non-sprint folders (legacy)
    try {
      const topEntries = await fs.readdir(INDEX_DIR, { withFileTypes: true });
      for (const entry of topEntries) {
        if (!entry.isDirectory()) continue;
        if (/^sprint-/i.test(entry.name)) continue;
        if (!/^(HU|EN)/i.test(entry.name)) continue;
        totalHUs++;
        const huDir = path.join(INDEX_DIR, entry.name);
        try {
          const autoMd = await fs.readFile(path.join(huDir, 'casos_automatizables.md'), 'utf8');
          const matches = autoMd.match(/CP-A\d+/g);
          if (matches) totalCPsAuto += new Set(matches).size;
        } catch {}
        try {
          const manMd = await fs.readFile(path.join(huDir, 'casos_manuales.md'), 'utf8');
          const matches = manMd.match(/CP-M\d+/g);
          if (matches) totalCPsManual += new Set(matches).size;
        } catch {}
      }
    } catch {}

    const total = totalCPsAuto + totalCPsManual;
    res.json({
      totalSprints: sprints.length,
      totalHUs,
      totalCPsAuto,
      totalCPsManual,
      ratioAutoManual: total > 0 ? Math.round((totalCPsAuto / total) * 100) : 0,
      coberturaPromedio: 0 // requires traceability data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`QA Portal server listening on port ${PORT}. Repo root: ${REPO_ROOT}`);
});
