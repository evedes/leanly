FROM node:24-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm run build

FROM node:24-alpine AS production-dependencies

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile
RUN pnpm add tsx

FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml* .
COPY --from=build /app/drizzle ./drizzle

COPY --from=build /app/src/database/migrate.ts ./src/database/migrate.ts
COPY --from=build /app/src/database/database.provider.ts ./src/database/database.provider.ts
COPY --from=build /app/src/database/schema ./src/database/schema

COPY --from=production-dependencies /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/src/main"]
