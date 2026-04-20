# Use Node.js 20-bullseye as the base image (includes more system libs)
FROM node:20-bullseye

# Install system dependencies for Chromium (required by Remotion)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy the rest of the server code
COPY . .

# Expose the standard Cloud Run port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
