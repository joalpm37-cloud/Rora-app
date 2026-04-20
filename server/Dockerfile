# Usar la imagen recomendada de Debian (Bookworm) para mayor estabilidad con Chromium
FROM node:20-bookworm-slim

# Instalar Chromium y dependencias mínimas de sistema
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurar variables de entorno globales para Remotion/Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev && npm cache clean --force

# Copiar el resto del código
COPY . .

# Exponer puerto para Cloud Run
EXPOSE 8080

# Iniciar servidor
CMD ["npm", "start"]
