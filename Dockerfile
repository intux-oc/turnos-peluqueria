# 1. Stage de Construcción (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Instalamos dependencias primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

# Definimos los ARG que vienen de Easypanel (Supabase)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Copiamos el resto del código y construimos
COPY . .
RUN npm run build

# 2. Stage de Ejecución (Runner)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiamos solo lo necesario del builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
