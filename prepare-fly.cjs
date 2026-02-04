const fs = require('fs');
const path = require('path');

const SERVER_INDEX = 'server/index.ts';

console.log("🚀 Preparando a Apoiotec para o Fly.io...");

// 1. Ajustando o server/index.ts para a Nuvem
if (fs.existsSync(SERVER_INDEX)) {
    let content = fs.readFileSync(SERVER_INDEX, 'utf8');

    // Troca porta fixa por variável de ambiente
    content = content.replace(/listen\(5000/g, 'listen(process.env.PORT || 5000');
    content = content.replace(/port:\s*5000/g, 'port: process.env.PORT || 5000');

    // Comenta ou envolve a leitura de certificados locais em IF
    if (content.includes('/opt/apoiotec/certs') && !content.includes('process.env.NODE_ENV')) {
        console.log("🛡️ Ajustando lógica de HTTPS para Produção...");
        content = content.replace(
            /(const\s+sslOptions\s*=[\s\S]*?};)/,
            "let sslOptions = {};\nif (process.env.NODE_ENV !== 'production') {\n  $1\n}"
        );
    }

    fs.writeFileSync(SERVER_INDEX, content);
    console.log("✅ server/index.ts ajustado (Porta e SSL).");
}

// 2. Criando o Dockerfile profissional
const dockerfileContent = `FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
# Instala o psql para o seu sistema de restore funcionar
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server/index.js"]`;

fs.writeFileSync('Dockerfile', dockerfileContent);
console.log("✅ Dockerfile criado com suporte a psql.");

// 3. Criando .dockerignore (Evita enviar lixo para a nuvem)
const dockerIgnore = `node_modules
dist
.env
backups
*.local
.git`;

fs.writeFileSync('.dockerignore', dockerIgnore);
console.log("✅ .dockerignore criado.");

console.log("\n✨ Tudo pronto! Seu sistema agora é 'Cloud Ready'.");