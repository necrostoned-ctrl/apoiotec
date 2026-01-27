#!/bin/bash

# ============================================
# APOIOTEC - DESINSTALADOR (LINUX)
# ============================================

set -e

# Configuration
APP_NAME="apoiotec"
APP_DIR="/opt/apoiotec"
APP_USER="apoiotec"
DB_NAME="apoiotec"
DB_USER="apoiotec"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║          APOIOTEC INFORMÁTICA - DESINSTALADOR                  ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}✗ Este script deve ser executado como root (sudo)${NC}"
    exit 1
fi

# Confirmation
echo -e "${RED}⚠ ATENÇÃO: Esta ação irá remover completamente o Apoiotec Informática!${NC}"
echo ""
echo "O que será removido:"
echo "  - Serviço systemd ($APP_NAME)"
echo "  - Aplicação em $APP_DIR"
echo "  - Usuário do sistema ($APP_USER)"
echo "  - Banco de dados PostgreSQL ($DB_NAME)"
echo "  - Usuário do banco ($DB_USER)"
echo ""
echo -e "${YELLOW}⚠ BACKUPS NÃO SERÃO REMOVIDOS (verifique $APP_DIR/backups)${NC}"
echo ""
read -p "Deseja continuar? (digite 'SIM' para confirmar): " confirmation

if [ "$confirmation" != "SIM" ]; then
    echo -e "${YELLOW}Desinstalação cancelada.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Iniciando desinstalação...${NC}"
echo ""

# Stop and disable service
if systemctl is-active --quiet $APP_NAME; then
    echo -e "${YELLOW}Parando serviço...${NC}"
    systemctl stop $APP_NAME
    echo -e "${GREEN}✓ Serviço parado${NC}"
fi

if systemctl is-enabled --quiet $APP_NAME 2>/dev/null; then
    echo -e "${YELLOW}Desabilitando serviço...${NC}"
    systemctl disable $APP_NAME
    echo -e "${GREEN}✓ Serviço desabilitado${NC}"
fi

# Remove service file
if [ -f "/etc/systemd/system/$APP_NAME.service" ]; then
    echo -e "${YELLOW}Removendo arquivo de serviço...${NC}"
    rm /etc/systemd/system/$APP_NAME.service
    systemctl daemon-reload
    echo -e "${GREEN}✓ Arquivo de serviço removido${NC}"
fi

# Remove application directory
if [ -d "$APP_DIR" ]; then
    # Ask about backups
    if [ -d "$APP_DIR/backups" ] && [ "$(ls -A $APP_DIR/backups)" ]; then
        echo ""
        echo -e "${YELLOW}⚠ Foram encontrados backups em $APP_DIR/backups${NC}"
        read -p "Deseja manter os backups? (S/n): " keep_backups
        
        if [ "$keep_backups" != "n" ] && [ "$keep_backups" != "N" ]; then
            echo -e "${YELLOW}Movendo backups para /tmp/apoiotec_backups...${NC}"
            mkdir -p /tmp/apoiotec_backups
            cp -r $APP_DIR/backups/* /tmp/apoiotec_backups/
            echo -e "${GREEN}✓ Backups salvos em /tmp/apoiotec_backups${NC}"
        fi
    fi
    
    echo -e "${YELLOW}Removendo diretório da aplicação...${NC}"
    rm -rf $APP_DIR
    echo -e "${GREEN}✓ Aplicação removida${NC}"
fi

# Remove system user
if id "$APP_USER" &>/dev/null; then
    echo -e "${YELLOW}Removendo usuário do sistema...${NC}"
    userdel $APP_USER 2>/dev/null || true
    echo -e "${GREEN}✓ Usuário do sistema removido${NC}"
fi

# Remove database
echo ""
read -p "Deseja remover o banco de dados PostgreSQL? (s/N): " remove_db

if [ "$remove_db" = "s" ] || [ "$remove_db" = "S" ]; then
    echo -e "${YELLOW}Removendo banco de dados...${NC}"
    sudo -u postgres psql <<EOF 2>/dev/null || true
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
EOF
    echo -e "${GREEN}✓ Banco de dados removido${NC}"
else
    echo -e "${YELLOW}⚠ Banco de dados mantido${NC}"
fi

# Ask about PostgreSQL and Node.js
echo ""
read -p "Deseja remover PostgreSQL? (s/N): " remove_pg
if [ "$remove_pg" = "s" ] || [ "$remove_pg" = "S" ]; then
    echo -e "${YELLOW}Removendo PostgreSQL...${NC}"
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        case $ID in
            ubuntu|debian)
                apt-get remove --purge -y postgresql postgresql-contrib
                apt-get autoremove -y
                ;;
            centos|fedora|rhel)
                dnf remove -y postgresql-server postgresql-contrib || yum remove -y postgresql-server postgresql-contrib
                ;;
        esac
    fi
    
    echo -e "${GREEN}✓ PostgreSQL removido${NC}"
fi

echo ""
read -p "Deseja remover Node.js? (s/N): " remove_node
if [ "$remove_node" = "s" ] || [ "$remove_node" = "S" ]; then
    echo -e "${YELLOW}Removendo Node.js...${NC}"
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        case $ID in
            ubuntu|debian)
                apt-get remove --purge -y nodejs
                apt-get autoremove -y
                ;;
            centos|fedora|rhel)
                dnf remove -y nodejs || yum remove -y nodejs
                ;;
        esac
    fi
    
    echo -e "${GREEN}✓ Node.js removido${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Desinstalação Concluída com Sucesso!              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -d "/tmp/apoiotec_backups" ]; then
    echo -e "${YELLOW}📦 Backups salvos em: /tmp/apoiotec_backups${NC}"
    echo ""
fi

echo "Obrigado por usar Apoiotec Informática!"
echo ""
