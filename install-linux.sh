#!/bin/bash

# ============================================
# APOIOTEC INFORMÁTICA - INSTALADOR LINUX
# ============================================
# Script de instalação automática para Ubuntu/Debian/CentOS/Fedora
# Execute como root: sudo ./install-linux.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="apoiotec"
APP_DIR="/opt/apoiotec"
APP_USER="apoiotec"
DB_NAME="apoiotec"
DB_USER="apoiotec"
DB_PASSWORD=""
SESSION_SECRET=""
NODE_VERSION="20"
SERVICE_FILE="apoiotec.service"

# ============================================
# HELPER FUNCTIONS
# ============================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Este script deve ser executado como root (sudo)"
        exit 1
    fi
    print_success "Verificação de permissões OK"
}

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        print_error "Não foi possível detectar o sistema operacional"
        exit 1
    fi
    print_success "Sistema detectado: $OS $OS_VERSION"
}

# ============================================
# INSTALLATION FUNCTIONS
# ============================================

install_nodejs() {
    print_header "Instalando Node.js $NODE_VERSION"
    
    if command -v node &> /dev/null; then
        NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VER" -ge "$NODE_VERSION" ]; then
            print_success "Node.js já instalado: $(node --version)"
            return 0
        fi
    fi
    
    case $OS in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
            apt-get install -y nodejs
            ;;
        centos|fedora|rhel)
            curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
            dnf install -y nodejs || yum install -y nodejs
            ;;
        *)
            print_error "Sistema operacional não suportado: $OS"
            exit 1
            ;;
    esac
    
    print_success "Node.js instalado: $(node --version)"
    print_success "npm instalado: $(npm --version)"
}

install_postgresql() {
    print_header "Instalando PostgreSQL"
    
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL já instalado: $(psql --version)"
    else
        case $OS in
            ubuntu|debian)
                apt-get update
                apt-get install -y postgresql postgresql-contrib
                ;;
            centos|fedora|rhel)
                dnf install -y postgresql-server postgresql-contrib || yum install -y postgresql-server postgresql-contrib
                postgresql-setup --initdb || true
                ;;
        esac
        print_success "PostgreSQL instalado"
    fi
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    print_success "PostgreSQL iniciado e habilitado"
}

configure_database() {
    print_header "Configurando Banco de Dados"
    
    # Generate random password if not set
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        print_info "Senha do banco gerada automaticamente (32 caracteres)"
    fi
    
    # Generate session secret if not set
    if [ -z "$SESSION_SECRET" ]; then
        SESSION_SECRET=$(openssl rand -hex 32)
        print_info "Chave de sessão gerada automaticamente"
    fi
    
    # Create database and user
    sudo -u postgres psql <<EOF
-- Drop existing if any
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user and database
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
    
    print_success "Banco de dados '$DB_NAME' criado"
    print_success "Usuário '$DB_USER' criado"
    
    # Configure pg_hba.conf
    PG_HBA=$(sudo -u postgres psql -t -P format=unaligned -c 'show hba_file')
    
    # Backup original
    cp "$PG_HBA" "${PG_HBA}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Add local connection rules if not exists
    if ! grep -q "# Apoiotec local connections" "$PG_HBA"; then
        cat >> "$PG_HBA" <<EOF

# Apoiotec local connections
local   $DB_NAME        $DB_USER                                md5
host    $DB_NAME        $DB_USER        127.0.0.1/32            md5
host    $DB_NAME        $DB_USER        ::1/128                 md5
EOF
        print_success "Configuração de autenticação atualizada"
        
        # Reload PostgreSQL
        systemctl reload postgresql
        print_success "PostgreSQL recarregado"
    fi
}

create_app_user() {
    print_header "Criando Usuário do Sistema"
    
    if id "$APP_USER" &>/dev/null; then
        print_success "Usuário '$APP_USER' já existe"
    else
        useradd -r -s /bin/false $APP_USER
        print_success "Usuário '$APP_USER' criado"
    fi
}

install_app() {
    print_header "Instalando Aplicação"
    
    # Create app directory
    mkdir -p $APP_DIR
    mkdir -p $APP_DIR/logs
    mkdir -p $APP_DIR/backups
    
    # Copy files
    CURRENT_DIR=$(pwd)
    print_info "Copiando arquivos de $CURRENT_DIR para $APP_DIR"
    
    # Backup existing .env if it exists
    if [ -f "$APP_DIR/.env" ]; then
        cp "$APP_DIR/.env" "$APP_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Backup do .env existente criado"
    fi
    
    # Copy all files except some directories
    rsync -av --exclude='node_modules' \
              --exclude='.git' \
              --exclude='logs' \
              --exclude='backups' \
              --exclude='.env' \
              --exclude='dist' \
              $CURRENT_DIR/ $APP_DIR/
    
    print_success "Arquivos copiados"
    
    # Create .env file (always overwrite with correct DB credentials)
    cat > "$APP_DIR/.env" <<EOF
NODE_ENV=production
PORT=5000
HOST=127.0.0.1

DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
PGHOST=localhost
PGPORT=5432
PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD
PGDATABASE=$DB_NAME

COMPANY_NAME=Apoiotec Informática
COMPANY_CNPJ=15.292.813.0001-70
COMPANY_ADDRESS=Rua Maestro Vila Lobos, N° 381, Abolição IV, Mossoró-RN
COMPANY_PHONE=84988288543 - 84988363828
COMPANY_EMAIL=albano@hotmail.dk - marcelo@live.no

SESSION_SECRET=$SESSION_SECRET
SESSION_MAX_AGE=604800000

DEFAULT_THEME=light
DEFAULT_FONT_SIZE=28
DEFAULT_PDF_FONT_SIZE=10
DEFAULT_FONT_FAMILY=inter
DEFAULT_PRIMARY_COLOR=#2563eb
DEFAULT_SECONDARY_COLOR=#00ff41

BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
LOG_LEVEL=info
LOG_DIR=./logs
EOF
    print_success "Arquivo .env criado/atualizado com credenciais do banco"
    
    # Set permissions
    chown -R $APP_USER:$APP_USER $APP_DIR
    chmod +x $APP_DIR/scripts/*.sh 2>/dev/null || true
    
    print_success "Permissões configuradas"
}

install_dependencies() {
    print_header "Instalando Dependências"
    
    cd $APP_DIR
    
    # Install all npm packages (need devDependencies for build)
    print_info "Instalando pacotes npm (isso pode demorar alguns minutos)..."
    sudo -u $APP_USER npm install
    
    print_success "Dependências instaladas"
}

build_app() {
    print_header "Compilando Aplicação"
    
    cd $APP_DIR
    
    # Build frontend and backend
    print_info "Compilando frontend e backend (isso pode demorar alguns minutos)..."
    sudo -u $APP_USER npm run build
    
    # Verify build artifacts
    if [ ! -f "$APP_DIR/dist/index.js" ]; then
        print_error "Falha na compilação: dist/index.js não foi criado"
        exit 1
    fi
    
    print_success "Aplicação compilada com sucesso"
}

run_migrations() {
    print_header "Executando Migrations"
    
    cd $APP_DIR
    
    # Run database migrations
    sudo -u $APP_USER npm run db:push
    
    print_success "Migrations executadas"
}

install_service() {
    print_header "Instalando Serviço Systemd"
    
    # Copy service file
    cp $APP_DIR/$SERVICE_FILE /etc/systemd/system/
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable service
    systemctl enable $APP_NAME
    
    print_success "Serviço instalado e habilitado"
}

start_service() {
    print_header "Iniciando Serviço"
    
    systemctl start $APP_NAME
    
    sleep 3
    
    if systemctl is-active --quiet $APP_NAME; then
        print_success "Serviço iniciado com sucesso"
    else
        print_error "Falha ao iniciar serviço"
        print_info "Verifique os logs: sudo journalctl -u $APP_NAME -n 50"
        exit 1
    fi
}

verify_installation() {
    print_header "Verificando Instalação"
    
    # Check if service is running
    if systemctl is-active --quiet $APP_NAME; then
        print_success "Serviço está rodando"
    else
        print_error "Serviço não está rodando"
        return 1
    fi
    
    # Check if port is listening
    sleep 2
    if ss -tlnp | grep -q ":5000"; then
        print_success "Porta 5000 está escutando"
    else
        print_warning "Porta 5000 não está respondendo ainda (pode levar alguns segundos)"
    fi
    
    # Test HTTP connection
    sleep 3
    if curl -s http://localhost:5000 > /dev/null; then
        print_success "Servidor HTTP respondendo"
    else
        print_warning "Servidor HTTP ainda não está respondendo (pode levar alguns segundos para inicializar)"
    fi
}

print_summary() {
    print_header "Instalação Concluída!"
    
    echo -e "${GREEN}"
    cat <<EOF
╔════════════════════════════════════════════════════════════════╗
║                  APOIOTEC INFORMÁTICA                          ║
║              Instalação Concluída com Sucesso!                 ║
╚════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo -e "${BLUE}📍 Informações do Sistema:${NC}"
    echo -e "   Diretório: $APP_DIR"
    echo -e "   Usuário: $APP_USER"
    echo -e "   Serviço: $APP_NAME"
    echo ""
    
    echo -e "${BLUE}🌐 Acesso ao Sistema:${NC}"
    echo -e "   URL: ${GREEN}http://localhost:5000${NC}"
    echo -e "   Usuário padrão: ${YELLOW}admin${NC}"
    echo -e "   Senha padrão: ${YELLOW}admin123${NC}"
    echo -e "   ${RED}⚠ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!${NC}"
    echo ""
    
    echo -e "${BLUE}💾 Banco de Dados:${NC}"
    echo -e "   Nome: $DB_NAME"
    echo -e "   Usuário: $DB_USER"
    echo -e "   Senha: ${YELLOW}$DB_PASSWORD${NC}"
    echo -e "   ${YELLOW}⚠ Guarde esta senha em local seguro!${NC}"
    echo ""
    
    echo -e "${BLUE}🔧 Comandos Úteis:${NC}"
    echo -e "   Status:    ${GREEN}sudo systemctl status $APP_NAME${NC}"
    echo -e "   Logs:      ${GREEN}sudo journalctl -u $APP_NAME -f${NC}"
    echo -e "   Parar:     ${GREEN}sudo systemctl stop $APP_NAME${NC}"
    echo -e "   Iniciar:   ${GREEN}sudo systemctl start $APP_NAME${NC}"
    echo -e "   Reiniciar: ${GREEN}sudo systemctl restart $APP_NAME${NC}"
    echo -e "   Backup:    ${GREEN}$APP_DIR/scripts/backup-database.sh${NC}"
    echo ""
    
    echo -e "${BLUE}📖 Documentação:${NC}"
    echo -e "   Instalação Linux:   $APP_DIR/INSTALL_LINUX.md"
    echo -e "   Troubleshooting:    $APP_DIR/TROUBLESHOOTING.md"
    echo ""
    
    echo -e "${GREEN}✓ O sistema está rodando e iniciará automaticamente quando o computador ligar!${NC}"
    echo ""
}

# ============================================
# MAIN INSTALLATION PROCESS
# ============================================

main() {
    print_header "APOIOTEC INFORMÁTICA - INSTALADOR LINUX"
    
    check_root
    detect_os
    
    install_nodejs
    install_postgresql
    configure_database
    create_app_user
    install_app
    install_dependencies
    build_app
    run_migrations
    install_service
    start_service
    verify_installation
    
    print_summary
}

# Run main function
main "$@"
