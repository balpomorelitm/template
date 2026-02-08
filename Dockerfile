FROM node:20-slim

# Instalar dependencias de sistema para Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libwayland-client0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm ci

# Instalar navegador Playwright
RUN npx playwright install chromium

# Copiar código fuente
COPY . .

# Puerto por defecto (ajustar según tu app)
EXPOSE 3000

# Comando por defecto: ejecutar capturas
CMD ["npm", "run", "screenshot"]
