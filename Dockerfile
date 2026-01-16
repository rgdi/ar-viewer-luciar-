FROM node:18-alpine

WORKDIR /app

# Copy package files first for caching
COPY server/package.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy server code
COPY server/src ./src

# Copy frontend code (Must go up one level to access root files)
# We structure the container so it matches the relative paths in server.js
WORKDIR /app
COPY index.html viewer.html ./
COPY assets ./assets

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Run command (from server directory)
WORKDIR /app/server
CMD ["node", "src/server.js"]
