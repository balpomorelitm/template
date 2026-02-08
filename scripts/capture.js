// ============================================================
// 📸 Script de captura de pantalla automática con Playwright
// ============================================================
// Uso:
//   npm run screenshot                          → captura URLs por defecto
//   npm run screenshot -- --url https://example.com
//   npm run screenshot -- --urls-file urls.txt  → una URL por línea
//   npm run screenshot -- --full-page           → captura página completa
//   npm run screenshot -- --device "iPhone 13"  → emular dispositivo
// ============================================================

const { chromium, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

// ─── Configuración ──────────────────────────────────────────
const CONFIG = {
  // URLs por defecto a capturar (modifica según tu proyecto)
  defaultUrls: [
    { url: 'http://localhost:3000', name: 'home' },
    // { url: 'http://localhost:3000/about', name: 'about' },
    // { url: 'http://localhost:3000/dashboard', name: 'dashboard' },
  ],

  // Carpeta de salida (será accedida vía GitHub Pages)
  outputDir: path.resolve(__dirname, '..', 'screenshots'),

  // Opciones por defecto de la captura
  viewport: { width: 1280, height: 720 },
  fullPage: false,
  format: 'png', // 'png' | 'jpeg'
  quality: 90,   // Solo para jpeg (1-100)

  // Tiempo máximo de espera para cargar la página (ms)
  timeout: 30000,

  // Espera adicional después de cargar (para animaciones/renders)
  waitAfterLoad: 1000,
};

// ─── Parsear argumentos CLI ─────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    urls: [],
    fullPage: CONFIG.fullPage,
    device: null,
    urlsFile: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        parsed.urls.push({ url: args[++i], name: slugify(args[i]) });
        break;
      case '--urls-file':
        parsed.urlsFile = args[++i];
        break;
      case '--full-page':
        parsed.fullPage = true;
        break;
      case '--device':
        parsed.device = args[++i];
        break;
      case '--output':
        CONFIG.outputDir = path.resolve(args[++i]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  return parsed;
}

function slugify(text) {
  return text
    .replace(/https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function printHelp() {
  console.log(`
📸 Screenshot Capture Tool
═══════════════════════════

Uso:
  node scripts/capture.js [opciones]

Opciones:
  --url <url>           URL a capturar (puede repetirse)
  --urls-file <file>    Archivo con URLs (una por línea)
  --full-page           Captura la página completa (scroll)
  --device <name>       Emular dispositivo (ej: "iPhone 13")
  --output <dir>        Directorio de salida
  --help                Mostrar esta ayuda

Ejemplos:
  node scripts/capture.js --url https://example.com
  node scripts/capture.js --urls-file urls.txt --full-page
  node scripts/capture.js --device "iPhone 13" --url https://example.com
  `);
}

// ─── Cargar URLs desde archivo ──────────────────────────────
function loadUrlsFromFile(filePath) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Archivo no encontrado: ${resolvedPath}`);
    process.exit(1);
  }

  return fs
    .readFileSync(resolvedPath, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((url) => ({ url, name: slugify(url) }));
}

// ─── Generar índice HTML ────────────────────────────────────
function generateIndex(captures) {
  const timestamp = new Date().toISOString();
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📸 Capturas de Pantalla</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      padding: 2rem;
    }
    h1 { color: #58a6ff; margin-bottom: 0.5rem; }
    .meta { color: #8b949e; margin-bottom: 2rem; font-size: 0.9rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .card:hover { border-color: #58a6ff; }
    .card img {
      width: 100%;
      display: block;
      cursor: pointer;
    }
    .card-info {
      padding: 1rem;
    }
    .card-info h3 { color: #f0f6fc; font-size: 1rem; }
    .card-info p { color: #8b949e; font-size: 0.85rem; margin-top: 0.25rem; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>📸 Capturas de Pantalla</h1>
  <p class="meta">Generado: ${timestamp}</p>
  <div class="grid">
    ${captures
      .map(
        (c) => `
    <div class="card">
      <a href="${c.filename}" target="_blank">
        <img src="${c.filename}" alt="${c.name}" loading="lazy" />
      </a>
      <div class="card-info">
        <h3>${c.name}</h3>
        <p>${c.url}</p>
      </div>
    </div>`
      )
      .join('\n')}
  </div>
</body>
</html>`;

  const indexPath = path.join(CONFIG.outputDir, 'index.html');
  fs.writeFileSync(indexPath, html);
  console.log(`📄 Índice generado: ${indexPath}`);
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  const args = parseArgs();

  // Determinar URLs a capturar
  let urls = args.urls.length > 0 ? args.urls : [];
  if (args.urlsFile) {
    urls = [...urls, ...loadUrlsFromFile(args.urlsFile)];
  }
  if (urls.length === 0) {
    urls = CONFIG.defaultUrls;
  }

  // Crear directorio de salida
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  console.log(`\n📸 Capturando ${urls.length} URL(s)...\n`);

  // Configurar navegador
  const launchOptions = { headless: true };
  const browser = await chromium.launch(launchOptions);

  const contextOptions = {
    viewport: CONFIG.viewport,
    ignoreHTTPSErrors: true,
  };

  // Emular dispositivo si se especifica
  if (args.device) {
    const device = devices[args.device];
    if (!device) {
      console.error(`❌ Dispositivo no reconocido: ${args.device}`);
      console.log('Dispositivos disponibles:', Object.keys(devices).join(', '));
      await browser.close();
      process.exit(1);
    }
    Object.assign(contextOptions, device);
    console.log(`📱 Emulando: ${args.device}`);
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  const captures = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

  for (const { url, name } of urls) {
    try {
      console.log(`  ⏳ Capturando: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: CONFIG.timeout,
      });

      // Espera adicional para renders/animaciones
      await page.waitForTimeout(CONFIG.waitAfterLoad);

      const filename = `${name}_${timestamp}.${CONFIG.format}`;
      const filePath = path.join(CONFIG.outputDir, filename);

      const screenshotOptions = {
        path: filePath,
        fullPage: args.fullPage,
        type: CONFIG.format,
      };

      if (CONFIG.format === 'jpeg') {
        screenshotOptions.quality = CONFIG.quality;
      }

      await page.screenshot(screenshotOptions);

      captures.push({ url, name, filename, filePath });
      console.log(`  ✅ Guardada: ${filename}`);
    } catch (error) {
      console.error(`  ❌ Error capturando ${url}: ${error.message}`);
    }
  }

  await browser.close();

  // Generar página índice HTML
  if (captures.length > 0) {
    generateIndex(captures);
  }

  console.log(`\n🎉 Completado: ${captures.length}/${urls.length} capturas guardadas en ${CONFIG.outputDir}\n`);

  // Generar resumen JSON para integración con otras herramientas
  const summary = {
    timestamp: new Date().toISOString(),
    total: urls.length,
    successful: captures.length,
    outputDir: CONFIG.outputDir,
    captures: captures.map((c) => ({
      url: c.url,
      name: c.name,
      filename: c.filename,
    })),
  };

  const summaryPath = path.join(CONFIG.outputDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📋 Resumen JSON: ${summaryPath}`);
}

main().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
