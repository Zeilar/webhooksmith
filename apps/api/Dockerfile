FROM node:24-slim AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
COPY types ./types

RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build

FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY --from=builder /app /app

WORKDIR /app/apps/api

EXPOSE 3030

CMD ["node", "dist/main"]
