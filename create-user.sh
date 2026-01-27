#!/bin/bash

# ============================================================================
# CREATE USER - Script para criar usuários de login no Apoiotec
# ============================================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    clear
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  CRIAR NOVO USUÁRIO - APOIOTEC INFORMÁTICA${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================================================
# VALIDAÇÕES
# ============================================================================

print_header

# Verificar se PostgreSQL está rodando
if ! sudo -u postgres psql -c "SELECT 1;" &>/dev/null; then
    print_error "PostgreSQL não está rodando"
    exit 1
fi
print_success "PostgreSQL conectado"

echo ""

# ============================================================================
# COLETAR INFORMAÇÕES
# ============================================================================

print_info "Preencha as informações do novo usuário:"
echo ""

# Username
read -p "👤 Nome de usuário (username): " USERNAME

if [[ -z "$USERNAME" ]]; then
    print_error "Nome de usuário não pode estar vazio"
    exit 1
fi

# Verificar se usuário já existe
EXISTING=$(sudo -u postgres psql apoiotec_db -t -c "SELECT username FROM users WHERE username = '$USERNAME';" 2>/dev/null)

if [[ ! -z "$EXISTING" ]]; then
    print_error "Usuário '$USERNAME' já existe no banco de dados"
    exit 1
fi

print_success "Nome de usuário disponível"
echo ""

# Nome completo
read -p "📝 Nome completo: " FULLNAME

if [[ -z "$FULLNAME" ]]; then
    print_error "Nome completo não pode estar vazio"
    exit 1
fi

print_success "Nome: $FULLNAME"
echo ""

# Senha
read -sp "🔐 Senha (não será exibida): " PASSWORD
echo ""

if [[ -z "$PASSWORD" ]]; then
    print_error "Senha não pode estar vazia"
    exit 1
fi

read -sp "🔐 Confirme a senha: " PASSWORD_CONFIRM
echo ""

if [[ "$PASSWORD" != "$PASSWORD_CONFIRM" ]]; then
    print_error "As senhas não correspondem"
    exit 1
fi

print_success "Senha confirmada"
echo ""

# ============================================================================
# GERAR HASH BCRYPT
# ============================================================================

print_info "Gerando hash da senha (bcrypt)..."

# Usar node.js para gerar o hash bcrypt
HASH=$(node -e "
const bcryptjs = require('bcryptjs');
const salt = bcryptjs.genSaltSync(10);
const hash = bcryptjs.hashSync('$PASSWORD', salt);
console.log(hash);
" 2>/dev/null)

if [[ $? -ne 0 ]] || [[ -z "$HASH" ]]; then
    print_error "Falha ao gerar hash da senha"
    print_info "Verifique se bcryptjs está instalado"
    exit 1
fi

print_success "Hash gerado"
echo ""

# ============================================================================
# RESUMO
# ============================================================================

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
print_info "RESUMO DO NOVO USUÁRIO"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo "  Username: $USERNAME"
echo "  Nome: $FULLNAME"
echo "  Hash: ${HASH:0:20}..."
echo ""

read -p "Deseja continuar e criar o usuário? (s/n): " CONFIRM

if [[ "$CONFIRM" != "s" ]]; then
    print_error "Criação de usuário cancelada"
    exit 0
fi

# ============================================================================
# INSERIR NO BANCO DE DADOS
# ============================================================================

print_info "Criando usuário no banco de dados..."

if sudo -u postgres psql apoiotec_db << EOF 2>/dev/null
INSERT INTO users (username, name, password) 
VALUES ('$USERNAME', '$FULLNAME', '$HASH');
EOF
then
    print_success "Usuário criado com sucesso!"
else
    print_error "Falha ao criar usuário no banco de dados"
    exit 1
fi

# ============================================================================
# CONFIRMAÇÃO FINAL
# ============================================================================

print_header
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ USUÁRIO CRIADO COM SUCESSO!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 DADOS DO NOVO USUÁRIO:${NC}"
echo "  Username: $USERNAME"
echo "  Nome: $FULLNAME"
echo ""
echo -e "${BLUE}🌐 ACESSO:${NC}"
echo "  URL: http://localhost:5000"
echo "  Usuário: $USERNAME"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
