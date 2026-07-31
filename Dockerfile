# =========================================
# DEPS
# =========================================
FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/landing/package.json apps/landing/package.json
RUN npm ci

# =========================================
# BUILD
# =========================================
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY . .

# NEXT_PUBLIC_* vars are inlined at build time, not read at runtime —
# they must be passed as build args (docker build --build-arg ...).
ARG NEXT_PUBLIC_CELL_NAME=msb
ARG NEXT_PUBLIC_APK_URL=
ENV NEXT_PUBLIC_CELL_NAME=${NEXT_PUBLIC_CELL_NAME}
ENV NEXT_PUBLIC_APK_URL=${NEXT_PUBLIC_APK_URL}

RUN npm run build --workspace=landing

# =========================================
# RUNTIME
# =========================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/public ./apps/landing/public

USER nextjs

ARG PORT=3000
ENV PORT=${PORT}
ENV HOSTNAME=0.0.0.0
EXPOSE ${PORT}

CMD ["node", "apps/landing/server.js"]
