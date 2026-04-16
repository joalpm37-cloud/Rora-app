# Use Node.js 20 slim as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json first to leverage Docker cache
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the server code
COPY . .

# Expose the port (Render provides $PORT, we default to 3001)
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
