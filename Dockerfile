FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="mysql://dummy:dummy@127.0.0.1:3306/dummy"
ENV BETTER_AUTH_SECRET="dummy_secret_dummy_secret_dummy_secret_dummy_secret"
ENV BETTER_AUTH_URL="http://localhost:3000"
RUN --mount=type=cache,target=/app/.next/cache \
    --mount=type=cache,target=/app/.turbo \
    pnpm turbo run build
RUN pnpm exec esbuild scripts/migrate.js --bundle --platform=node --outfile=migrate-bundled.js

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src/db/migrations ./migrations
COPY --from=builder --chown=nextjs:nodejs /app/migrate-bundled.js ./migrate.js

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "node migrate.js && node server.js"]
