/**
 * sync-assets.js
 * Escanea la raíz del repositorio en busca de carpetas HU* o EN*,
 * copia sus archivos a src/assets/repo-files/<carpeta>/
 * y genera src/assets/repo-files/repo-files.json
 *
 * Ejecutar: node sync-assets.js
 */

const fs   = require('fs');
const path = require('path');

const REPO_ROOT   = path.resolve(__dirname, '..');
const ASSETS_DIR  = path.join(__dirname, 'src', 'assets');          // HU folders go here
const INDEX_DIR   = path.join(__dirname, 'src', 'assets', 'repo-files'); // index JSON goes here

// Extensiones a incluir
const ALLOWED = ['.md', '.ts', '.txt', '.json'];

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function scanRepo() {
  const result = [];

  const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!/^(HU|EN)/i.test(entry.name)) continue;

    const folderPath = path.join(REPO_ROOT, entry.name);
    const files      = fs.readdirSync(folderPath).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ALLOWED.includes(ext) && fs.statSync(path.join(folderPath, f)).isFile();
    });

    if (files.length === 0) continue;

    result.push({ name: entry.name, path: entry.name, files });

    // Copiar archivos a assets/<HU>/
    const destDir = path.join(ASSETS_DIR, entry.name);
    ensureDir(destDir);
    for (const file of files) {
      fs.copyFileSync(
        path.join(folderPath, file),
        path.join(destDir, file)
      );
    }

    console.log(`  ✔ ${entry.name} → ${files.length} archivo(s)`);
  }

  return result;
}

// Asegura que existan las carpetas base
ensureDir(ASSETS_DIR);
ensureDir(INDEX_DIR);

console.log('Sincronizando HU/EN desde:', REPO_ROOT);
const index = scanRepo();

// Escribe el índice JSON en repo-files/repo-files.json
const indexPath = path.join(INDEX_DIR, 'repo-files.json');
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

// Además, generar un índice de carpetas existentes en assets (assets-index.json)
const assetsIndex = fs.readdirSync(ASSETS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^(HU|EN)/i.test(d.name))
  .map(d => d.name);
const assetsIndexPath = path.join(ASSETS_DIR, 'assets-index.json');
fs.writeFileSync(assetsIndexPath, JSON.stringify(assetsIndex, null, 2), 'utf8');

console.log(`\nÍndice generado: ${indexPath}`);
console.log(`Assets index generado: ${assetsIndexPath}`);
console.log(`Total HU/EN encontradas: ${index.length}`);
