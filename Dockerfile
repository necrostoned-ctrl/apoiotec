# 1. Fase de Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Fase de Produção
FROM node:20-slim
WORKDIR /app

# INSTALAÇÃO DO PSQL 17 (Para evitar o erro de Server Version Mismatch)
RUN apt-get update && apt-get install -y curl ca-certificates gnupg \
    && curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /usr/share/keyrings/pgdg.gpg > /dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update && apt-get install -y postgresql-client-17 \
    && rm -rf /var/lib/apt/lists/*

# Copia tudo da fase anterior
COPY --from=builder /app ./

# Garante que o Node rode em modo produção
ENV NODE_ENV=production
ENV PORT=8080

# EXPOSTA a porta para o Fly.io
EXPOSE 8080

# Comando de inicialização

# --- OTIMIZAÇÃO APOIOTEC: SWAP PARA PREVENIR OOM ---
RUN fallocate -l 512M /swapfile && chmod 600 /swapfile && mkswap /swapfile
# --------------------------------------------------

CMD swapon /swapfile && node dist/index.js