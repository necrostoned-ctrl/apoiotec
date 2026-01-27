# Instalação no Linux - Apoiotec Informática

Guia completo de instalação para Ubuntu/Debian, CentOS/Fedora e derivados.

## 📋 Pré-requisitos

- Ubuntu 20.04+, Debian 11+, CentOS 8+, Fedora 35+ ou similar
- Acesso sudo/root
- Conexão com internet
- 2GB RAM (mínimo) / 4GB RAM (recomendado)
- 2GB espaço em disco

## 🚀 Instalação Rápida (Recomendado)

### Passo 1: Baixar o Código do Replit

Opção A - Download ZIP:
```bash
# Baixe o ZIP do Replit e extraia
unzip apoiotec.zip
cd apoiotec
```

Opção B - Git Clone:
```bash
git clone https://github.com/seu-usuario/apoiotec.git
cd apoiotec
```

### Passo 2: Executar Instalador Automático

```bash
# Dar permissão de execução
chmod +x install-linux.sh

# Executar instalador
sudo ./install-linux.sh
```

O instalador vai:
- ✅ Verificar e instalar Node.js 20
- ✅ Instalar e configurar PostgreSQL
- ✅ Criar banco de dados "apoiotec"
- ✅ Instalar todas as dependências npm
- ✅ Configurar variáveis de ambiente
- ✅ Executar migrations do banco
- ✅ Criar usuário do sistema "apoiotec"
- ✅ Instalar como serviço systemd
- ✅ Iniciar automaticamente

### Passo 3: Verificar Instalação

```bash
# Verificar se o serviço está rodando
sudo systemctl status apoiotec

# Verificar logs
sudo journalctl -u apoiotec -f

# Acessar o sistema
# Abra navegador em: http://localhost:5000
```

---

## 📖 Instalação Manual Detalhada

Se preferir instalar manualmente ou o instalador automático falhou:

### Passo 1: Instalar Node.js 20

**Ubuntu/Debian:**
```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

**CentOS/Fedora:**
```bash
# Adicionar repositório NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Instalar Node.js
sudo dnf install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

### Passo 2: Instalar PostgreSQL

**Ubuntu/Debian:**
```bash
# Atualizar repositórios
sudo apt update

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar e habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

**CentOS/Fedora:**
```bash
# Instalar PostgreSQL
sudo dnf install -y postgresql-server postgresql-contrib

# Inicializar banco de dados
sudo postgresql-setup --initdb

# Iniciar e habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

### Passo 3: Configurar Banco de Dados

```bash
# Trocar para usuário postgres
sudo -u postgres psql

# No prompt do PostgreSQL, execute:
CREATE USER apoiotec WITH PASSWORD 'sua_senha_forte_aqui';
CREATE DATABASE apoiotec OWNER apoiotec;
GRANT ALL PRIVILEGES ON DATABASE apoiotec TO apoiotec;

# Sair do PostgreSQL
\q
```

**Configurar autenticação (permitir conexões locais):**

```bash
# Editar arquivo de configuração
sudo nano /etc/postgresql/*/main/pg_hba.conf
# (ou /var/lib/pgsql/data/pg_hba.conf no CentOS/Fedora)

# Adicionar ou modificar estas linhas:
local   all             apoiotec                                md5
host    all             apoiotec        127.0.0.1/32            md5
host    all             apoiotec        ::1/128                 md5

# Salvar e reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Passo 4: Configurar Aplicação

```bash
# Navegar até o diretório do projeto
cd /caminho/para/apoiotec

# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

**Configure o arquivo .env:**
```env
NODE_ENV=production
PORT=5000
HOST=127.0.0.1

# Altere a senha para a que você criou no passo 3
DATABASE_URL=postgresql://apoiotec:sua_senha_forte_aqui@localhost:5432/apoiotec

# Configure informações da empresa
COMPANY_NAME=Apoiotec Informática
COMPANY_CNPJ=15.292.813.0001-70
COMPANY_ADDRESS=Rua Maestro Vila Lobos, N° 381, Abolição IV, Mossoró-RN
COMPANY_PHONE=84988288543 - 84988363828
COMPANY_EMAIL=contato@apoiotec.com.br

# Gere uma chave secreta aleatória
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### Passo 5: Instalar Dependências

```bash
# Instalar pacotes npm
npm install

# Executar migrations do banco de dados
npm run db:push
```

### Passo 6: Criar Usuário do Sistema

```bash
# Criar usuário para rodar a aplicação
sudo useradd -r -s /bin/false apoiotec

# Mover aplicação para diretório padrão
sudo mkdir -p /opt/apoiotec
sudo cp -r . /opt/apoiotec/
sudo chown -R apoiotec:apoiotec /opt/apoiotec
```

### Passo 7: Criar Serviço Systemd

```bash
# Copiar arquivo de serviço
sudo cp apoiotec.service /etc/systemd/system/

# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar serviço (inicia automaticamente)
sudo systemctl enable apoiotec

# Iniciar serviço
sudo systemctl start apoiotec

# Verificar status
sudo systemctl status apoiotec
```

### Passo 8: Verificar Instalação

```bash
# Ver logs em tempo real
sudo journalctl -u apoiotec -f

# Verificar se está escutando na porta 5000
sudo ss -tlnp | grep 5000

# Testar conexão
curl http://localhost:5000
```

---

## 🔧 Gerenciamento do Serviço

```bash
# Ver status
sudo systemctl status apoiotec

# Parar serviço
sudo systemctl stop apoiotec

# Iniciar serviço
sudo systemctl start apoiotec

# Reiniciar serviço
sudo systemctl restart apoiotec

# Desabilitar início automático
sudo systemctl disable apoiotec

# Habilitar início automático
sudo systemctl enable apoiotec

# Ver logs
sudo journalctl -u apoiotec -f

# Ver logs das últimas 100 linhas
sudo journalctl -u apoiotec -n 100

# Ver logs de hoje
sudo journalctl -u apoiotec --since today
```

## 💾 Backup do Banco de Dados

```bash
# Backup manual
./scripts/backup-database.sh

# Backups são salvos em: backups/apoiotec_YYYY-MM-DD_HH-MM-SS.sql

# Agendar backup diário (crontab)
sudo crontab -e
# Adicionar linha:
0 2 * * * /opt/apoiotec/scripts/backup-database.sh
```

## 🔄 Restaurar Backup

```bash
# Parar serviço
sudo systemctl stop apoiotec

# Restaurar backup
sudo -u postgres psql -d apoiotec -f backups/apoiotec_2025-01-15_02-00-00.sql

# Iniciar serviço
sudo systemctl start apoiotec
```

## 🌐 Acesso Remoto (Opcional)

Para acessar de outros computadores na rede:

```bash
# 1. Editar .env
sudo nano /opt/apoiotec/.env

# Alterar HOST
HOST=0.0.0.0

# 2. Configurar firewall
sudo ufw allow 5000/tcp  # Ubuntu/Debian
sudo firewall-cmd --permanent --add-port=5000/tcp  # CentOS/Fedora
sudo firewall-cmd --reload  # CentOS/Fedora

# 3. Reiniciar serviço
sudo systemctl restart apoiotec
```

## 🗑️ Desinstalação

```bash
sudo ./scripts/uninstall.sh
```

## ⚠️ Problemas Comuns

### Erro: "Connection refused" ao acessar localhost:5000

```bash
# Verificar se serviço está rodando
sudo systemctl status apoiotec

# Verificar logs
sudo journalctl -u apoiotec -n 50

# Verificar se porta está em uso
sudo ss -tlnp | grep 5000
```

### Erro: "ECONNREFUSED" ao conectar no banco

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Testar conexão manual
psql -h localhost -U apoiotec -d apoiotec
# Digite a senha configurada

# Verificar configurações no .env
cat /opt/apoiotec/.env | grep DATABASE
```

### Erro: "Permission denied"

```bash
# Corrigir permissões
sudo chown -R apoiotec:apoiotec /opt/apoiotec
sudo chmod +x /opt/apoiotec/server/index.js
```

### Serviço não inicia automaticamente

```bash
# Verificar se está habilitado
sudo systemctl is-enabled apoiotec

# Habilitar
sudo systemctl enable apoiotec

# Verificar logs de boot
sudo journalctl -b | grep apoiotec
```

## 📞 Suporte

Consulte: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
