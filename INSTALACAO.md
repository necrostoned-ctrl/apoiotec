# Apoiotec Informática - Guia de Instalação

## Linguagem e Tecnologias Utilizadas

Este aplicativo foi desenvolvido utilizando:

- **Frontend**: React 18 com TypeScript
- **Backend**: Node.js com Express.js e TypeScript  
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Build Tool**: Vite para desenvolvimento e produção
- **UI**: Tailwind CSS + shadcn/ui components
- **Runtime**: Node.js v18+ (recomendado v20)

## Pré-requisitos para Windows

1. **Node.js** (versão 18 ou superior)
   - Baixe em: https://nodejs.org/
   - Escolha a versão LTS (Long Term Support)

2. **PostgreSQL** (versão 14 ou superior)
   - Baixe em: https://www.postgresql.org/download/windows/
   - Durante a instalação, anote a senha do usuário `postgres`

3. **Git** (opcional, mas recomendado)
   - Baixe em: https://git-scm.com/download/win

## Instalação Manual no Windows

### Passo 1: Configurar o Banco de Dados
```cmd
# Abra o prompt de comando como administrador
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE apoiotec_db;

# Crie um usuário (opcional)
CREATE USER apoiotec_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE apoiotec_db TO apoiotec_user;

# Saia do PostgreSQL
\q
```

### Passo 2: Baixar e Configurar o Projeto
```cmd
# Clone ou baixe o projeto
git clone [URL_DO_REPOSITORIO] apoiotec
cd apoiotec

# Ou se baixou em ZIP, extraia e navegue até a pasta
cd caminho\para\apoiotec
```

### Passo 3: Instalar Dependências
```cmd
# Instale as dependências do Node.js
npm install
```

### Passo 4: Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
# Configuração do Banco de Dados
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/apoiotec_db"

# Porta do servidor (opcional)
PORT=5000

# Ambiente
NODE_ENV=production
```

### Passo 5: Configurar o Banco de Dados
```cmd
# Execute as migrações do banco
npm run db:push
```

### Passo 6: Executar o Aplicativo
```cmd
# Para desenvolvimento
npm run dev

# Para produção
npm run build
npm start
```

O aplicativo estará disponível em: http://localhost:5000

## Auto Instalador (Versão Avançada)

Para criar um auto instalador completo, você precisaria:

### Opção 1: Installer com Electron
- Empacote o app como aplicativo desktop com Electron
- Use ferramentas como `electron-builder` para criar instaladores .exe
- Inclua Node.js e PostgreSQL portable

### Opção 2: Docker (Recomendado)
```dockerfile
# Crie um Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Opção 3: Installer com NSIS ou Inno Setup
- Crie script de instalação que:
  - Instala Node.js automaticamente
  - Configura PostgreSQL
  - Copia arquivos do app
  - Cria atalhos no desktop
  - Configura serviço Windows

## Estrutura de Pastas

```
apoiotec/
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Tipos e schemas compartilhados
├── package.json     # Dependências principais
├── vite.config.ts   # Configuração do build
└── drizzle.config.ts # Configuração do banco
```

## Usuário Padrão para Acesso Rápido

O sistema inclui um **usuário padrão hardcoded** que funciona independentemente do banco de dados:

- **Usuário:** `setup`
- **Senha:** `setup123`

Este usuário permite acesso imediato após a instalação, sem necessidade de criar usuários no banco de dados. Ele sempre estará disponível, mesmo em caso de problemas.

**Após o primeiro login, recomenda-se:**
1. Alterar a senha do usuário "setup"
2. Criar novos usuários com permissões específicas
3. Manter este usuário para recuperação em emergências

## Criar Novos Usuários

Para criar novos usuários no sistema, utilize o script `criar-usuario.sh`:

```bash
# Linux/Mac
bash criar-usuario.sh

# Windows (em uma pasta do projeto via terminal ou PowerShell)
node -e "const bcryptjs = require('bcryptjs'); console.log(bcryptjs.hashSync('sua_senha', 10));"
# Copie o hash gerado e execute no PostgreSQL:
# psql -U apoiotec -d apoiotec_db -c "INSERT INTO users (username, name, password) VALUES ('novo_usuario', 'Nome Completo', 'HASH_AQUI');"
```

## Comandos Úteis

```cmd
# Desenvolvimento
npm run dev          # Inicia dev server

# Produção
npm run build        # Compila para produção
npm start           # Inicia servidor produção

# Banco de Dados
npm run db:push     # Aplica mudanças no schema
npm run db:studio   # Interface visual do banco
```

## Resolução de Problemas

### Erro de Conexão com Banco
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste conexão: `psql -U postgres -h localhost`

### Erro de Porta em Uso
- Mude a porta no arquivo `.env`
- Use: `netstat -ano | findstr :5000` para ver processos

### Problemas de Permissão
- Execute cmd como administrador
- Verifique permissões da pasta do projeto

## Suporte

Para suporte técnico, consulte:
- Logs do aplicativo em `logs/`
- Console do navegador (F12)
- Logs do PostgreSQL em `Program Files\PostgreSQL\data\log\`