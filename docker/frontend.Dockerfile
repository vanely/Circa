# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install pnpm globally and create non-root user
RUN npm install -g pnpm && \
    addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY --chown=frontend:nodejs package.json pnpm-lock.yaml* ./
COPY --chown=frontend:nodejs apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --chown=frontend:nodejs apps/frontend ./apps/frontend/

# Set working directory to frontend app
WORKDIR /app/apps/frontend

# Build the application
RUN pnpm build

# Change ownership of the entire app directory
RUN chown -R frontend:nodejs /app

# Switch to non-root user
USER frontend

# Expose port
EXPOSE 3000

# Start the preview server to serve the built files
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "3000"]
