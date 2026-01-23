# ---------- Build stage ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmjs.org/

COPY prisma ./prisma
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY eslint.config.mjs ./
COPY prisma.config.ts ./

RUN npx prisma generate

RUN npm run build

RUN npx tsc prisma.config.ts --module commonjs --outDir ./dist-config

# ---------- Production stage ----------
FROM node:22-alpine AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD npx tsx node_modules/.bin/prisma migrate deploy --config prisma.config.ts && node dist/src/main