FROM node:18-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY server/package.json server/package-lock.json ./server/

# Install production dependencies
WORKDIR /app/server
RUN npm ci --omit=dev

# Copy server source code
COPY server/src ./src

# Copy frontend files
WORKDIR /app
COPY index.html viewer.html ./
COPY assets ./assets

# Create data directory for SQLite DB + uploads
RUN mkdir -p /app/server/data

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 3000

# Environment
ENV PORT=3000
ENV NODE_ENV=production
ENV DATA_DIR=/app/server/data

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run
WORKDIR /app/server
CMD ["node", "src/server.js"]
