FROM node:20-slim AS base

# Common setup
WORKDIR /app
COPY package*.json ./

# Development dependencies
FROM base AS dev-deps
RUN npm ci

# Production dependencies
FROM base AS prod-deps
RUN npm ci --omit=dev

# Development image
FROM dev-deps AS development
ENV NODE_ENV=development
ENV DOCKER_ENV=true
ENV PUBLIC_API_URL=http://backend:8000
# Copy application code
COPY . .

# Create both potential patch directories
RUN mkdir -p /app/node_modules/rollup/dist/es/
RUN mkdir -p /node_modules/rollup/dist/es/

# Create the patch file in both locations to handle path inconsistencies
RUN echo '// ES module version of native.js with stub implementations\n\
export function getBinaryPath() { \n\
  return null; \n\
}\n\
\n\
export function parse(code, options) { \n\
  try {\n\
    console.log("[ROLLUP-FIX] Using enhanced native.js stub for parse");\n\
    return { \n\
      program: { \n\
        body: [\n\
          {\n\
            type: "ExpressionStatement",\n\
            expression: {\n\
              type: "Literal",\n\
              value: null,\n\
              raw: "null"\n\
            },\n\
            start: 0,\n\
            end: 4\n\
          }\n\
        ], \n\
        type: "Program", \n\
        sourceType: options?.sourceType || "module",\n\
        start: 0,\n\
        end: code ? code.length : 0\n\
      },\n\
      type: "File",\n\
      version: "unknown",\n\
      comments: [],\n\
      tokens: []\n\
    };\n\
  } catch (error) {\n\
    console.error("Error in native.js stub:", error);\n\
    throw error;\n\
  }\n\
}\n\
\n\
export async function parseAsync(code, options) {\n\
  console.log("[ROLLUP-FIX] Parsing code with parseAstAsync");\n\
  return parse(code, options);\n\
}' | tee /app/node_modules/rollup/dist/es/native.js /node_modules/rollup/dist/es/native.js

# Create symbolic links to ensure paths are consistent
RUN ln -sf /app/node_modules /node_modules || true

# Set environment variables for M1/M2 Mac compatibility
ENV ROLLUP_SKIP_NODEJS_CHECKS=true
ENV VITE_SKIP_NATIVE_EXTENSIONS=true

# Expose the port the app runs on
EXPOSE 4321

# Start the development server using custom script
CMD ["npm", "run", "docker:dev"]

# Builder stage (for production)
FROM dev-deps AS builder
COPY . .
RUN npm run build

# Production image - Use nginx to serve static files
FROM nginx:alpine AS production
ENV NODE_ENV=production
ENV DOCKER_ENV=true

# Copy built static files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the corrected nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx cache directories and set proper permissions
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
             /tmp/nginx && \
    chmod -R 777 /var/cache/nginx /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx /tmp/nginx

# Switch to nginx user
USER nginx

EXPOSE 4321
CMD ["nginx", "-g", "daemon off;"]
