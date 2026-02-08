// @ts-check
const { defineConfig } = require('playwright/test');

module.exports = defineConfig({
  use: {
    // Navegador por defecto
    browserName: 'chromium',
    // Viewport estándar para las capturas
    viewport: { width: 1280, height: 720 },
    // Ignorar errores HTTPS en desarrollo
    ignoreHTTPSErrors: true,
  },
  // Directorio donde se guardan las capturas
  outputDir: './screenshots',
});
