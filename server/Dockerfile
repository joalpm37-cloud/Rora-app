FROM node:20-slim

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
