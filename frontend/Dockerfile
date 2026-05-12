# 1. Aşama: Bağımlılıkların yüklenmesi
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# 2. Aşama: Uygulamanın derlenmesi (Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetrisini kapatıyoruz (Gizlilik ve hız için)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Aşama: Çalışma ortamı (Runner)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Güvenlik için root olmayan bir kullanıcı oluşturuyoruz
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sadece gerekli olan dosyaları builder aşamasından alıyoruz
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Standalone modunda server.js üzerinden çalıştırıyoruz
CMD ["node", "server.js"]