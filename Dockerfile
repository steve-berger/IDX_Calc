# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/app.db
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN mkdir -p /data

# Standalone Next.js server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Full node_modules for prisma CLI, seed scripts, and VPI sync
COPY --from=builder /app/node_modules ./node_modules

# Prisma schema + migrations for runtime migration
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Generated Prisma client + source files needed by entrypoint scripts
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/src/lib/index-provider ./src/lib/index-provider
COPY --from=builder /app/scripts ./scripts

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
