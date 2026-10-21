# syntax=docker/dockerfile:1

# ==========================================
# Base Stage: Node.js with pnpm package manager
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm via corepack matching host version
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package manifests first for optimal Docker layer caching
COPY package.json pnpm-lock.yaml ./

# ==========================================
# Development Stage: Vite dev server with hot reload
# ==========================================
FROM base AS development
ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]

# ==========================================
# Builder Stage: Compile production bundle
# ==========================================
FROM base AS builder
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# ==========================================
# Production Stage: High-performance Nginx web server
# ==========================================
FROM nginx:alpine AS production

# Remove default nginx static files and configurations
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure file permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Healthcheck to verify web server responsiveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/health || exit 1

EXPOSE 80

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
