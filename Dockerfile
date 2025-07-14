# Etapa de build
FROM node:lts-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Build args para variáveis de ambiente Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_PWA_NAME
ARG NEXT_PUBLIC_PWA_SHORT_NAME
ARG NEXT_PUBLIC_APP_URL

# Definir as variáveis de ambiente para o build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_PWA_NAME=$NEXT_PUBLIC_PWA_NAME
ENV NEXT_PUBLIC_PWA_SHORT_NAME=$NEXT_PUBLIC_PWA_SHORT_NAME
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY . .
COPY package*.json ./
RUN npm install
RUN npm run build

# Etapa de produção
FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3002
CMD ["npm", "start"]
