# Multi-stage production build for Vite + React
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Enable pnpm and install deps
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (if exists)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
