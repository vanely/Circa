# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install pnpm globally and create non-root user
RUN npm install -g pnpm && \
    addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY --chown=backend:nodejs package.json pnpm-lock.yaml* ./
COPY --chown=backend:nodejs apps/backend/package.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema
COPY --chown=backend:nodejs apps/backend/prisma ./apps/backend/prisma/

# Generate Prisma client
RUN pnpm --filter @circa/api db:generate

# Copy source code
COPY --chown=backend:nodejs apps/backend ./apps/backend/

# Build the application
RUN pnpm --filter @circa/api build

# Change ownership of the entire app directory
RUN chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3333

# Set working directory to backend app
WORKDIR /app/apps/backend

# Run database migrations and start the server
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]
