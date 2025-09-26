# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install pnpm globally, OpenSSL, and create non-root user
RUN npm install -g pnpm && \
    apk add --no-cache openssl && \
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

# Install backend dependencies and generate Prisma client
WORKDIR /app/apps/backend
RUN pnpm install
RUN pnpm db:generate

# Copy source code and tsconfig (excluding node_modules)
COPY --chown=backend:nodejs apps/backend/src ./src/
COPY --chown=backend:nodejs apps/backend/tsconfig.json ./
COPY --chown=backend:nodejs apps/backend/.env* ./

# Build the application
RUN pnpm build

# Change ownership of the entire app directory
RUN chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3333

# Set working directory to backend app
WORKDIR /app/apps/backend

# Start the development server with file watching
CMD ["sh", "-c", "pnpm start:dev"]
