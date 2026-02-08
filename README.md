# 📸 My Project Template

[![Screenshots](https://github.com/USERNAME/REPO/actions/workflows/screenshots.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/screenshots.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-latest-blue.svg)](https://playwright.dev/)

> Plantilla base para proyectos con **captura de pantalla automática** y publicación en **GitHub Pages**.

---

## ✨ Características

- **Capturas automáticas** con [Playwright](https://playwright.dev/) (multi-navegador)
- **GitHub Actions** para CI/CD: genera capturas en cada push
- **GitHub Pages** para acceso público a las capturas
- **Galería HTML** auto-generada con todas las capturas
- **Resumen JSON** para integración con otras herramientas
- **Docker** listo para ejecutar en contenedores
- **Emulación de dispositivos** (móvil, tablet, desktop)

## 📁 Estructura del proyecto

```
├── .github/workflows/      # GitHub Actions (CI/CD)
│   └── screenshots.yml     # Workflow de capturas
├── .vscode/                 # Configuración editor
├── scripts/
│   └── capture.js           # Script de capturas
├── screenshots/             # Capturas generadas (→ GitHub Pages)
├── src/                     # Tu código fuente
├── urls.txt                 # Lista de URLs a capturar
├── Dockerfile               # Soporte Docker
├── docker-compose.yml       # Docker Compose
├── playwright.config.js     # Configuración Playwright
└── package.json
```

## 🚀 Inicio rápido

### 1. Usar como plantilla

Haz clic en **"Use this template"** en GitHub, o clona:

```bash
git clone https://github.com/USERNAME/REPO.git mi-proyecto
cd mi-proyecto
```

### 2. Instalar dependencias

```bash
npm install
```

> Esto también instala automáticamente el navegador Chromium para Playwright.

### 3. Configurar URLs

Edita `urls.txt` con las URLs que quieres capturar:

```txt
http://localhost:3000
http://localhost:3000/about
http://localhost:3000/dashboard
```

O modifica la configuración directamente en `scripts/capture.js`.

### 4. Ejecutar capturas

```bash
# Capturas con URLs por defecto (urls.txt o configuración)
npm run screenshot

# Captura una URL específica
npm run screenshot -- --url https://example.com

# Captura de página completa (con scroll)
npm run screenshot:full

# Emular un dispositivo móvil
npm run screenshot -- --device "iPhone 13"
```

## 📸 Uso avanzado

### CLI completo

```bash
node scripts/capture.js [opciones]

Opciones:
  --url <url>           URL a capturar (puede repetirse)
  --urls-file <file>    Archivo con URLs (una por línea)
  --full-page           Captura la página completa (scroll)
  --device <name>       Emular dispositivo (ej: "iPhone 13")
  --output <dir>        Directorio de salida
  --help                Mostrar ayuda
```

### Ejemplos

```bash
# Múltiples URLs
node scripts/capture.js --url https://example.com --url https://google.com

# Desde archivo con página completa
node scripts/capture.js --urls-file urls.txt --full-page

# Emulación de iPhone
node scripts/capture.js --device "iPhone 13" --url https://example.com

# Directorio de salida personalizado
node scripts/capture.js --output ./mis-capturas
```

## 🔄 CI/CD con GitHub Actions

El workflow se ejecuta automáticamente en cada push a `main` y:

1. Instala dependencias y Playwright
2. Ejecuta las capturas de pantalla
3. Genera una galería HTML
4. Publica en GitHub Pages

### Activar GitHub Pages

1. Ve a **Settings → Pages** en tu repositorio
2. En "Source" selecciona **GitHub Actions**
3. Las capturas estarán en: `https://USERNAME.github.io/REPO/`

### Ejecución manual

También puedes ejecutar el workflow manualmente desde la pestaña **Actions**:
- Especifica URLs personalizadas
- Activa captura de página completa

## 🐳 Docker

```bash
# Construir imagen
docker build -t mi-proyecto .

# Ejecutar capturas
docker compose run screenshot

# O directamente
docker run -v $(pwd)/screenshots:/app/screenshots mi-proyecto
```

## 📋 Archivos generados

Después de cada ejecución, en `screenshots/` encontrarás:

| Archivo | Descripción |
|---------|-------------|
| `*.png` | Capturas de pantalla individuales |
| `index.html` | Galería visual con todas las capturas |
| `summary.json` | Resumen JSON para integración programática |

### `summary.json` (ejemplo)

```json
{
  "timestamp": "2026-02-08T12:00:00.000Z",
  "total": 3,
  "successful": 3,
  "captures": [
    { "url": "http://localhost:3000", "name": "home", "filename": "home_2026-02-08.png" }
  ]
}
```

## 🔧 Personalización

### Cambiar la configuración por defecto

Edita el objeto `CONFIG` en `scripts/capture.js`:

```js
const CONFIG = {
  defaultUrls: [
    { url: 'http://localhost:3000', name: 'home' },
    { url: 'http://localhost:3000/about', name: 'about' },
  ],
  viewport: { width: 1920, height: 1080 },  // Resolución
  fullPage: true,                             // Página completa
  format: 'jpeg',                             // Formato de imagen
  quality: 85,                                // Calidad JPEG
  timeout: 30000,                             // Timeout de carga
  waitAfterLoad: 2000,                        // Espera post-carga
};
```

### Integrar con tu aplicación

En `.github/workflows/screenshots.yml`, descomenta las secciones para iniciar tu app:

```yaml
- name: 🚀 Iniciar aplicación
  run: npm start &

- name: ⏳ Esperar a que la app esté lista
  run: npx wait-on http://localhost:3000
```

## 📝 Cómo usar esta plantilla

1. **Crea un nuevo repo** desde esta plantilla
2. **Reemplaza** `USERNAME/REPO` en este README y en los badges
3. **Configura** las URLs en `urls.txt`
4. **Activa** GitHub Pages en Settings → Pages → GitHub Actions
5. **Añade** tu código en `src/`
6. **Push** y las capturas se generan automáticamente

---

## 📄 Licencia

[MIT](LICENSE)
