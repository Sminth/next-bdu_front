FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- deps ----
FROM base AS deps
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM base AS build
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# ---- runtime ----
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]

