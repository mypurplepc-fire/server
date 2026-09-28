# syntax=docker/dockerfile:1

# ---------- deps: full dependency tree (includes the Prisma CLI) ----------
FROM node:24-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder: generate Prisma client, then build Next ----------
FROM node:24-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=1536
# Placeholder so any eager Prisma initialisation during the build does not fail.
# The real value is provided by docker-compose at runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generates src/generated/prisma from prisma/schema.prisma. No DB needed.
RUN npx prisma generate
RUN npm run build

# ---------- runner ----------
FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Full node_modules so the Prisma CLI is available for `migrate deploy`.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Prisma schema + migrations + config, used by the entrypoint.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src/generated ./src/generated

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs \
    && chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "run", "start"]
