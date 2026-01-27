# Tutorial de Deployment - Apoiotec Informática no Ubuntu Server

## ⚠️ IMPORTANTE - LEIA PRIMEIRO

**O servidor DEVE usar PM2 ou Systemd para rodar 24/7!** Sem isso, o aplicativo cai quando você fecha o terminal ou o servidor reinicia. Veja a seção "**Manter o Servidor Rodando 24/7 (OBRIGATÓRIO)**" após iniciar o servidor.

---

## Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Node.js](#instalação-do-nodejs)
3. [Instalação do PostgreSQL](#instalação-do-postgresql)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Setup do Projeto](#setup-do-projeto)
6. [Configuração do Servidor](#configuração-do-servidor)
7. [Iniciando o Servidor](#iniciando-o-servidor)
8. [⚠️ Manter o Servidor Rodando 24/7](#-obrigatório-manter-o-servidor-rodando-247) **← OBRIGATÓRIO**
9. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

- Ubuntu Server 22.04+ LTS
- Acesso root ou sudo
- Conhecimento básico de terminal Linux
- Espaço em disco: ~1GB

---

## Instalação do Node.js

Execute os seguintes comandos:

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar curl (se não tiver)
sudo apt install -y curl

# Instalar Node.js v20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

**Resultado esperado:**
```
v20.19.0 (ou superior)
10.8.0 (ou superior)
```

---

## Instalação do PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

**Resultado esperado:** Deve mostrar `active (running)`

---

## Configuração do Banco de Dados

### 1. Criar o banco de dados

```bash
sudo -u postgres psql << 'EOF'
CREATE DATABASE apoiotec_db;
EOF
```

### 2. Criar usuário PostgreSQL

```bash
sudo -u postgres psql << 'EOF'
CREATE USER apoiotec WITH PASSWORD 'senha123';
GRANT ALL PRIVILEGES ON DATABASE apoiotec_db TO apoiotec;
\c apoiotec_db
GRANT ALL ON SCHEMA public TO apoiotec;
EOF
```

### 3. Verificar criação

```bash
sudo -u postgres psql apoiotec_db -c "SELECT version();"
```

---

## Setup do Projeto

### 1. Clonar/Extrair o projeto

```bash
# Se estiver em /home/aptc
cd /home/aptc
mkdir -p sistemaapoiotec
cd sistemaapoiotec

# Extrair os arquivos do projeto aqui
# (você deve colocar os arquivos do projeto neste diretório)
```

### 2. Instalar dependências

```bash
cd /home/aptc/sistemaapoiotec/TechSupportManager
npm install
```

---

## Configuração do Servidor

### 1. Criar arquivo .env

```bash
cat > /home/aptc/sistemaapoiotec/TechSupportManager/.env << 'EOF'
DATABASE_URL="postgresql://apoiotec:senha123@localhost:5432/apoiotec_db"
NODE_ENV=development
PORT=5000
EOF
```

### 2. Atualizar server/db.ts

O arquivo deve estar assim:

```bash
sudo tee /home/aptc/sistemaapoiotec/TechSupportManager/server/db.ts > /dev/null << 'EOF'
import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
EOF
```

### 3. Atualizar server/index.ts (adicionar dotenv no topo)

Abra o arquivo com:
```bash
sudo nano /home/aptc/sistemaapoiotec/TechSupportManager/server/index.ts
```

Certifique-se de que a **primeira linha** é:
```javascript
import 'dotenv/config';
```

Se não estiver, adicione antes de qualquer outro import.

### 4. Rodar migrations do banco

```bash
cd /home/aptc/sistemaapoiotec/TechSupportManager
npm run db:push
```

**Resultado esperado:** Deve sincronizar o banco com o schema

### 5. Criar usuário admin padrão

```bash
sudo -u postgres psql apoiotec_db << 'EOF'
DELETE FROM users WHERE username = 'admin';
INSERT INTO users (username, name, password) VALUES ('admin', 'Administrador', '$2b$10$XCyY5NR5VsQkCuiiCU0dy.8fTOFmrErX7ufiGbTXRI/2HSrkq1ZnW');
SELECT id, username FROM users WHERE username = 'admin';
EOF
```

**Resultado esperado:** Deve retornar a linha do usuário admin

---

## Iniciando o Servidor

### 1. Primeira execução (teste)

```bash
cd /home/aptc/sistemaapoiotec/TechSupportManager
npm run dev
```

Aguarde 5-10 segundos. Deve mostrar:
```
2:XX:XX PM [express] serving on port 5000
```

### 2. Testar login

Em **outro terminal** do Ubuntu:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**Resultado esperado:** Deve retornar dados do usuário:
```json
{"id":..,"username":"admin","name":"Administrador"}
```

### 3. Acessar via navegador

Abra o navegador e acesse:
```
http://localhost:5000
```

Faça login com:
- **Username:** admin
- **Password:** admin

---

## ⚠️ OBRIGATÓRIO: Manter o Servidor Rodando 24/7

**IMPORTANTE:** O servidor não pode ficar rodando apenas no terminal! Se você fechar o terminal ou o servidor reiniciar, o aplicativo vai cair. Use **UMA DESTAS OPÇÕES** para manter o servidor rodando automaticamente.

### Opção 1: Usar PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Ir para o diretório do projeto
cd /home/aptc/sistemaapoiotec/TechSupportManager

# Iniciar com PM2
pm2 start "npm run dev" --name "apoiotec"

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup

# Ver status
pm2 list
```

### Opção 2: Usar Systemd

Crie um arquivo de serviço:

```bash
sudo tee /etc/systemd/system/apoiotec.service > /dev/null << 'EOF'
[Unit]
Description=Apoiotec Informática
After=network.target postgresql.service

[Service]
Type=simple
User=aptc
WorkingDirectory=/home/aptc/sistemaapoiotec/TechSupportManager
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Ativar o serviço
sudo systemctl daemon-reload
sudo systemctl enable apoiotec
sudo systemctl start apoiotec

# Ver status
sudo systemctl status apoiotec
```

---

## Troubleshooting

### Problema 1: "DATABASE_URL must be set"

**Solução:**
```bash
# Verificar se .env existe
cat /home/aptc/sistemaapoiotec/TechSupportManager/.env

# Se não existir, criar:
cat > /home/aptc/sistemaapoiotec/TechSupportManager/.env << 'EOF'
DATABASE_URL="postgresql://apoiotec:senha123@localhost:5432/apoiotec_db"
NODE_ENV=development
PORT=5000
EOF
```

### Problema 2: "Connection refused" ao banco

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver, iniciar:
sudo systemctl start postgresql

# Testar conexão:
sudo -u postgres psql -c "SELECT 1;"
```

### Problema 3: "Invalid credentials" no login

**Solução:**
```bash
# Verificar se o usuário admin existe:
sudo -u postgres psql apoiotec_db -c "SELECT id, username FROM users WHERE username = 'admin';"

# Se não existir, criar:
sudo -u postgres psql apoiotec_db << 'EOF'
INSERT INTO users (username, name, password) VALUES ('admin', 'Administrador', '$2b$10$XCyY5NR5VsQkCuiiCU0dy.8fTOFmrErX7ufiGbTXRI/2HSrkq1ZnW');
EOF
```

### Problema 4: Porta 5000 já em uso

**Solução:**
```bash
# Encontrar processo usando porta 5000
sudo lsof -i :5000

# Matar o processo (substituir PID)
sudo kill -9 <PID>

# Ou mudar a porta no .env:
# Editar .env e mudar PORT=5000 para PORT=3000 (ou outra)
```

### Problema 5: Sem acesso ao servidor por firewall

**Solução:**
```bash
# Permitir porta 5000 no firewall
sudo ufw allow 5000

# Se não tiver ufw ativo:
sudo apt install -y ufw
sudo ufw enable
sudo ufw allow 5000
```

---

## Credenciais Padrão

| Item | Valor |
|------|-------|
| **BD User** | apoiotec |
| **BD Password** | senha123 |
| **BD Name** | apoiotec_db |
| **App User** | admin |
| **App Password** | admin |
| **Port** | 5000 |

---

## Backup do Banco de Dados

### Fazer backup

```bash
sudo -u postgres pg_dump apoiotec_db > backup_apoiotec_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup

```bash
sudo -u postgres psql apoiotec_db < backup_apoiotec_YYYYMMDD_HHMMSS.sql
```

---

## Monitoramento

### Ver logs em tempo real

Com PM2:
```bash
pm2 logs apoiotec
```

Com Systemd:
```bash
sudo journalctl -u apoiotec -f
```

### Reiniciar servidor

Com PM2:
```bash
pm2 restart apoiotec
```

Com Systemd:
```bash
sudo systemctl restart apoiotec
```

---

## Próximos Passos (Produção)

1. **SSL/HTTPS**: Configurar certificado Let's Encrypt
2. **Reverse Proxy**: Usar Nginx ou Apache
3. **Backups Automáticos**: Configurar cron para backups diários
4. **Monitoramento**: Configurar alerts (ex: Prometheus + Grafana)
5. **Logs Centralizados**: Usar ELK ou similar

---

## Suporte

Se encontrar problemas:
1. Verificar os logs (veja seção Monitoramento)
2. Seguir troubleshooting acima
3. Verificar conexão do banco: `sudo -u postgres psql apoiotec_db`
4. Testar API: `curl -X GET http://localhost:5000/api/settings`

---

**Última atualização:** 29 de Novembro de 2025
