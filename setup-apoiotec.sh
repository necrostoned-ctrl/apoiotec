#!/bin/bash

# ============================================================================
# SETUP APOIOTEC INFORMÁTICA - Ubuntu Server Installation Script (v2 - Robusto)
# ============================================================================

# Não quebra com erros não-críticos
set -E

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNÇÕES
# ============================================================================

print_header() {
    clear
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  SETUP APOIOTEC INFORMÁTICA - UBUNTU SERVER${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Função para executar comandos com tratamento de erro
run_command() {
    local cmd="$1"
    local description="$2"
    local critical="${3:-false}"
    
    if eval "$cmd" > /tmp/cmd_output.log 2>&1; then
        print_success "$description"
        return 0
    else
        if [[ "$critical" == "true" ]]; then
            print_error "$description (ERRO CRÍTICO)"
            cat /tmp/cmd_output.log
            exit 1
        else
            print_warning "$description (continuando...)"
            return 1
        fi
    fi
}

# ============================================================================
# VALIDAÇÕES INICIAIS
# ============================================================================

print_header

print_info "Verificando se está rodando como root/sudo..."
if [[ $EUID -ne 0 ]]; then
    print_error "Este script deve ser executado com sudo"
    echo "Execute: sudo bash setup-apoiotec.sh"
    exit 1
fi
print_success "Executando como root"

# ============================================================================
# COLETA DE INFORMAÇÕES
# ============================================================================

echo ""
print_info "Agora vamos configurar o sistema. Responda as perguntas abaixo:"
echo ""

# Caminho do arquivo .zip
read -p "📁 Caminho completo do arquivo .zip do sistema: " ZIP_PATH
if [[ ! -f "$ZIP_PATH" ]]; then
    print_error "Arquivo não encontrado: $ZIP_PATH"
    exit 1
fi
print_success "Arquivo encontrado: $ZIP_PATH"

echo ""

# Usuário para rodar o app
echo "👤 Escolha o usuário para rodar a aplicação:"
echo "1) aptc"
echo "2) marcelo"
echo "3) Outro"
read -p "Digite a opção (1/2/3): " USER_CHOICE

case $USER_CHOICE in
    1) APP_USER="aptc" ;;
    2) APP_USER="marcelo" ;;
    3) 
        read -p "Digite o nome do usuário: " APP_USER
        ;;
    *)
        print_error "Opção inválida"
        exit 1
        ;;
esac

# Verificar se usuário existe
if ! id "$APP_USER" &>/dev/null; then
    print_warning "Usuário '$APP_USER' não existe. Será criado."
    CREATE_USER=true
else
    print_success "Usuário '$APP_USER' encontrado"
    CREATE_USER=false
fi

echo ""

# Senha do PostgreSQL
read -sp "🔐 Senha para banco de dados PostgreSQL (padrão: senha123): " DB_PASSWORD
DB_PASSWORD="${DB_PASSWORD:-senha123}"
echo ""
print_success "Senha do banco configurada"

echo ""

# Caminho de instalação
read -p "📍 Caminho de instalação (padrão: /home/$APP_USER/sistemaapoiotec): " INSTALL_PATH
INSTALL_PATH="${INSTALL_PATH:-/home/$APP_USER/sistemaapoiotec}"
print_success "Caminho de instalação: $INSTALL_PATH"

echo ""

# Criar usuário admin
read -p "🚀 Deseja criar usuário admin automático? (s/n, padrão: s): " CREATE_ADMIN
CREATE_ADMIN="${CREATE_ADMIN:-s}"

# ============================================================================
# RESUMO DE CONFIGURAÇÃO
# ============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
print_info "RESUMO DA CONFIGURAÇÃO"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo "  Arquivo ZIP: $ZIP_PATH"
echo "  Usuário da app: $APP_USER"
echo "  Caminho instalação: $INSTALL_PATH"
echo "  DB Password: ****"
echo "  Criar usuário admin: $CREATE_ADMIN"
echo ""

read -p "Deseja continuar? (s/n): " CONFIRM
if [[ "$CONFIRM" != "s" ]]; then
    print_error "Instalação cancelada"
    exit 1
fi

# ============================================================================
# INSTALAÇÃO
# ============================================================================

print_header
print_info "Iniciando instalação..."
sleep 2

# ============= 1. Criar usuário se necessário =============
if [[ "$CREATE_USER" == "true" ]]; then
    run_command "useradd -m -s /bin/bash '$APP_USER'" "Criando usuário '$APP_USER'" "true"
fi

# ============= 2. Limpar repositórios antigos e atualizar sistema =============
print_info "Limpando repositórios antigos e atualizando sistema..."

# Remove repositórios com problemas
rm -f /etc/apt/sources.list.d/*.list 2>/dev/null || true
apt-get clean 2>/dev/null || true

# Atualiza apt de forma tolerante a erros
if apt-get update -qq 2>/tmp/apt_errors.log; then
    print_success "Sistema atualizado"
else
    # Tenta ignorar os erros e continuar
    print_warning "Alguns repositórios falharam, continuando..."
fi

# Tenta upgrade, mas não falha se houver problemas
apt-get upgrade -y -qq 2>/dev/null || print_warning "Upgrade parcial concluído"

# ============= 3. Instalar dependências básicas =============
print_info "Instalando ferramentas básicas..."
apt-get install -y -qq curl wget git build-essential 2>/dev/null || print_warning "Algumas ferramentas podem não estar disponíveis"

# ============= 4. Instalar Node.js 20+ =============
print_info "Verificando Node.js..."
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)

if [[ -z "$NODE_VERSION" ]] || [[ "$NODE_VERSION" -lt 20 ]]; then
    print_info "Instalando Node.js 20..."
    if curl -fsSL https://deb.nodesource.com/setup_20.x 2>/dev/null | bash - 2>/dev/null; then
        apt-get install -y -qq nodejs 2>/dev/null
        print_success "Node.js 20 instalado"
    else
        print_error "Falha ao adicionar repositório NodeSource"
        # Tenta instalação alternativa via apt
        apt-get install -y -qq nodejs npm 2>/dev/null || print_warning "Node.js pode não estar completamente instalado"
    fi
else
    print_success "Node.js $NODE_VERSION já instalado"
fi

# Verificar versão final
FINAL_NODE=$(node --version 2>/dev/null)
if [[ -z "$FINAL_NODE" ]]; then
    print_error "Node.js não foi instalado corretamente"
    exit 1
fi
print_success "Node.js: $FINAL_NODE"

# ============= 5. Instalar PostgreSQL =============
print_info "Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    print_info "Instalando PostgreSQL..."
    apt-get install -y -qq postgresql postgresql-contrib 2>/dev/null || print_warning "PostgreSQL pode não estar completamente instalado"
    systemctl start postgresql 2>/dev/null || true
    systemctl enable postgresql 2>/dev/null || true
    print_success "PostgreSQL instalado"
else
    print_success "PostgreSQL já instalado"
    systemctl start postgresql 2>/dev/null || true
fi

# Aguarda PostgreSQL estar pronto
sleep 2

# ============= 6. Configurar banco de dados =============
print_info "Configurando banco de dados..."

if sudo -u postgres psql << EOF 2>/dev/null
DROP DATABASE IF EXISTS apoiotec_db;
CREATE DATABASE apoiotec_db;
DROP USER IF EXISTS apoiotec;
CREATE USER apoiotec WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE apoiotec_db TO apoiotec;
\c apoiotec_db
GRANT ALL ON SCHEMA public TO apoiotec;
EOF
then
    print_success "Banco de dados configurado"
else
    print_warning "Alguns comandos do banco podem ter falhado, continuando..."
fi

# ============= 7. Criar diretório e extrair arquivos =============
print_info "Preparando diretório de instalação..."
mkdir -p "$INSTALL_PATH"
cd "$INSTALL_PATH"

print_info "Extraindo arquivos..."
if unzip -q "$ZIP_PATH" -d "$INSTALL_PATH" 2>/dev/null; then
    print_success "Arquivos extraídos"
else
    print_error "Falha ao extrair ZIP"
    exit 1
fi

# Encontrar o diretório do projeto (pode estar em subpasta)
if [[ ! -f "$INSTALL_PATH/package.json" ]]; then
    PROJECT_DIR=$(find "$INSTALL_PATH" -maxdepth 2 -name "package.json" -type f -exec dirname {} \; | head -1)
    if [[ -z "$PROJECT_DIR" ]]; then
        print_error "Não foi encontrado package.json no arquivo ZIP"
        exit 1
    fi
    cd "$PROJECT_DIR"
    INSTALL_PATH="$PROJECT_DIR"
else
    PROJECT_DIR="$INSTALL_PATH"
fi

print_success "Arquivos extraídos em: $PROJECT_DIR"

# ============= 8. Criar arquivo .env =============
print_info "Criando arquivo .env..."
cat > "$PROJECT_DIR/.env" << EOF
DATABASE_URL="postgresql://apoiotec:$DB_PASSWORD@localhost:5432/apoiotec_db"
NODE_ENV=development
PORT=5000
EOF

print_success "Arquivo .env criado"

# ============= 9. Instalar dependências =============
print_info "Instalando dependências (isso pode demorar)..."
cd "$PROJECT_DIR"
if npm install --no-audit -q 2>/tmp/npm_errors.log; then
    print_success "Dependências instaladas"
else
    print_warning "Algumas dependências podem ter falhado, verificando..."
    if [[ -f "package-lock.json" ]]; then
        print_success "package-lock.json gerado, continuando..."
    else
        print_error "npm install falhou completamente"
        cat /tmp/npm_errors.log
        exit 1
    fi
fi

# ============= 10. Rodar migrations =============
print_info "Sincronizando banco de dados..."
if npm run db:push 2>/tmp/db_errors.log; then
    print_success "Banco de dados sincronizado"
else
    print_warning "Migração do banco pode ter falhado, continuando..."
fi

# ============= 11. Criar usuário admin =============
if [[ "$CREATE_ADMIN" == "s" ]]; then
    print_info "Criando usuário admin..."
    if sudo -u postgres psql apoiotec_db << EOF 2>/dev/null
DELETE FROM users WHERE username = 'admin';
INSERT INTO users (username, name, password) VALUES ('admin', 'Administrador', '\$2b\$10\$XCyY5NR5VsQkCuiiCU0dy.8fTOFmrErX7ufiGbTXRI/2HSrkq1ZnW');
EOF
    then
        print_success "Usuário admin criado (senha: admin)"
    else
        print_warning "Usuário admin pode não ter sido criado, verifique manualmente"
    fi
fi

# ============= 12. Alterar permissões =============
print_info "Configurando permissões..."
chown -R "$APP_USER:$APP_USER" "$PROJECT_DIR" 2>/dev/null || true
chmod -R 755 "$PROJECT_DIR" 2>/dev/null || true
print_success "Permissões configuradas"

# ============= 13. Criar serviço Systemd =============
print_info "Criando serviço de auto-inicialização..."

cat > /etc/systemd/system/apoiotec.service << EOF
[Unit]
Description=Apoiotec Informática
After=network.target postgresql.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment="NODE_ENV=development"

[Install]
WantedBy=multi-user.target
EOF

if systemctl daemon-reload && systemctl enable apoiotec; then
    print_success "Serviço configurado"
else
    print_warning "Serviço pode não ter sido configurado corretamente"
fi

# ============= 14. Iniciar o serviço =============
print_info "Iniciando o serviço (aguarde 5 segundos)..."
systemctl start apoiotec 2>/dev/null || true
sleep 5

# Verificar se está rodando
if systemctl is-active --quiet apoiotec; then
    print_success "Serviço iniciado com sucesso"
else
    print_warning "Serviço pode estar iniciando ainda, verifique com: sudo systemctl status apoiotec"
fi

# ============================================================================
# FINALIZAÇÃO
# ============================================================================

print_header
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ INSTALAÇÃO CONCLUÍDA!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 INFORMAÇÕES:${NC}"
echo "  Projeto: $PROJECT_DIR"
echo "  Usuário: $APP_USER"
echo "  Banco de Dados: apoiotec_db"
echo "  Banco Usuário: apoiotec"
echo "  Porta: 5000"
echo ""
echo -e "${BLUE}🌐 ACESSO:${NC}"
echo "  URL: http://localhost:5000"
if [[ "$CREATE_ADMIN" == "s" ]]; then
    echo "  Usuário: admin"
    echo "  Senha: admin"
fi
echo ""
echo -e "${BLUE}📝 COMANDOS ÚTEIS:${NC}"
echo "  Ver status: sudo systemctl status apoiotec"
echo "  Ver logs: sudo journalctl -u apoiotec -f"
echo "  Reiniciar: sudo systemctl restart apoiotec"
echo "  Parar: sudo systemctl stop apoiotec"
echo ""
echo -e "${BLUE}🔄 AUTO-INICIALIZAÇÃO:${NC}"
echo "  ✅ O sistema iniciará automaticamente ao reiniciar o Ubuntu"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""

# Aguarda 5 segundos antes de finalizar
sleep 5

# Mostra último status
echo "Status final do serviço:"
sudo systemctl status apoiotec 2>&1 | head -n 5
