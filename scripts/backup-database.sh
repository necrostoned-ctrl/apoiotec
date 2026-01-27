#!/bin/bash

# ============================================
# APOIOTEC - BACKUP DO BANCO DE DADOS (LINUX)
# ============================================

set -e

# Load environment variables
if [ -f "/opt/apoiotec/.env" ]; then
    export $(cat /opt/apoiotec/.env | grep -v '^#' | xargs)
elif [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${PGDATABASE:-apoiotec}"
DB_USER="${PGUSER:-apoiotec}"
DB_PASSWORD="${PGPASSWORD}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/apoiotec_$TIMESTAMP.sql"

echo -e "${YELLOW}Iniciando backup do banco de dados...${NC}"
echo "Banco: $DB_NAME"
echo "Arquivo: $BACKUP_FILE"

# Export password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Create backup
if pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"; then
    # Compress backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Backup criado com sucesso!${NC}"
    echo "  Arquivo: $BACKUP_FILE"
    echo "  Tamanho: $SIZE"
    
    # Clean old backups
    if [ "$RETENTION_DAYS" -gt 0 ]; then
        echo -e "${YELLOW}Removendo backups antigos (mais de $RETENTION_DAYS dias)...${NC}"
        find "$BACKUP_DIR" -name "apoiotec_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
        REMAINING=$(find "$BACKUP_DIR" -name "apoiotec_*.sql.gz" -type f | wc -l)
        echo -e "${GREEN}✓ Backups mantidos: $REMAINING${NC}"
    fi
else
    echo -e "${RED}✗ Erro ao criar backup!${NC}"
    exit 1
fi

# Clear password
unset PGPASSWORD
