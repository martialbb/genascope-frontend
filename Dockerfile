FROM node:20-slim AS base

# Install dependencies needed for the build
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create default environment files if they don't exist
RUN if [ ! -f .env.development ]; then \
    echo "# Default development environment variables\nPUBLIC_API_URL=http://localhost:8000\nPUBLIC_BASE_URL=http://localhost:4321" > .env.development; \
    fi
RUN if [ ! -f .env.production ]; then \
    echo "# Default production environment variables\nPUBLIC_API_URL=http://backend:8000\nPUBLIC_BASE_URL=http://localhost:4321" > .env.production; \
    fi

# Runtime environment variables will override these defaults
RUN npm run build

# Production image, copy build files and start the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro
USER astro

# Copy only the necessary files
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package.json ./

# Expose the port the app runs on
EXPOSE 4321

# Command to run the application
CMD ["node", "./dist/server/entry.mjs"]
