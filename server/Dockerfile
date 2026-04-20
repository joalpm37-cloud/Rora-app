# Use Node.js 20-slim as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and lock file to leverage cache
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy the rest of the server code
COPY . .

# Expose the standard Cloud Run port
EXPOSE 8080

# Start the server using the production start command
CMD ["npm", "start"]
