# Guia de Instalação - Apoiotec Informática no Windows

## Como executar a aplicação no Windows como servidor

### Pré-requisitos

1. **Node.js 18+**
   - Baixar de: https://nodejs.org/
   - Instalar a versão LTS (Long Term Support)

2. **PostgreSQL 14+**
   - Baixar de: https://www.postgresql.org/download/windows/
   - Durante a instalação, anote a senha do usuário postgres

3. **Git** (opcional, para clonagem)
   - Baixar de: https://git-scm.com/download/win

### Passos de Instalação

#### 1. Preparar o ambiente
```bash
# Criar pasta para o projeto
mkdir C:\apoiotec
cd C:\apoiotec

# Clonar ou copiar os arquivos do projeto
# git clone [repositório] .
```

#### 2. Configurar banco de dados
```sql
-- Conectar no PostgreSQL como usuário postgres
-- Criar banco de dados
CREATE DATABASE apoiotec_db;

-- Criar usuário para a aplicação
CREATE USER apoiotec_user WITH PASSWORD 'senha_segura_aqui';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE apoiotec_db TO apoiotec_user;
```

#### 3. Configurar variáveis de ambiente
Criar arquivo `.env` na raiz do projeto:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://apoiotec_user:senha_segura_aqui@localhost:5432/apoiotec_db
```

#### 4. Instalar dependências
```bash
npm install
```

#### 5. Executar migrações do banco
```bash
npm run db:push
```

#### 6. Build da aplicação
```bash
npm run build
```

#### 7. Iniciar o servidor
```bash
npm start
```

### Configuração para Acesso Remoto

#### 1. Configurar Firewall do Windows
- Abrir "Windows Defender Firewall"
- Clicar em "Configurações Avançadas"
- Adicionar nova regra de entrada:
  - Tipo: Porta
  - Protocolo: TCP
  - Porta: 3000 (ou a porta configurada)
  - Ação: Permitir conexão

#### 2. Descobrir IP da máquina
```bash
ipconfig
```
Anotar o IP da rede local (ex: 192.168.1.100)

#### 3. Configurar roteador (se necessário)
Para acesso via internet:
- Configurar Port Forwarding no roteador
- Porta externa: 80 ou 8080
- Porta interna: 3000
- IP destino: IP da máquina Windows

### Acesso à Aplicação

#### Local:
- http://localhost:3000

#### Rede Local:
- http://[IP_DA_MAQUINA]:3000
- Exemplo: http://192.168.1.100:3000

#### Internet (com port forwarding):
- http://[IP_PUBLICO]:80
- Ou através de domínio configurado

### Execução como Serviço do Windows

#### 1. Instalar PM2 globalmente
```bash
npm install -g pm2
npm install -g pm2-windows-service
```

#### 2. Configurar PM2
```bash
# Iniciar aplicação com PM2
pm2 start npm --name "apoiotec" -- start

# Salvar configuração
pm2 save

# Instalar como serviço do Windows
pm2-service-install
```

#### 3. Configurar serviço
- Nome do serviço: PM2
- Inicialização automática: Sim
- Executar como: Sistema

### Manutenção

#### Verificar status do serviço:
```bash
pm2 status
pm2 logs apoiotec
```

#### Reiniciar aplicação:
```bash
pm2 restart apoiotec
```

#### Atualizar aplicação:
```bash
# Parar aplicação
pm2 stop apoiotec

# Atualizar código
git pull  # ou copiar novos arquivos

# Reinstalar dependências (se necessário)
npm install

# Rebuild
npm run build

# Reiniciar
pm2 restart apoiotec
```

### Backup e Segurança

#### 1. Backup do banco de dados
```bash
# Automatizar backup diário
pg_dump -h localhost -U apoiotec_user apoiotec_db > backup_$(date +%Y%m%d).sql
```

#### 2. Configurações de segurança
- Usar HTTPS em produção (certificado SSL)
- Configurar senhas fortes para banco
- Limitar acesso por IP quando possível
- Atualizar sistema regularmente

### Monitoramento

#### 1. Logs da aplicação
```bash
# Ver logs em tempo real
pm2 logs apoiotec --lines 100

# Logs salvos em:
# C:\Users\[usuario]\.pm2\logs\
```

#### 2. Performance
```bash
# Monitor de recursos
pm2 monit
```

### Resolução de Problemas

#### Aplicação não inicia:
1. Verificar se PostgreSQL está rodando
2. Conferir string de conexão no .env
3. Verificar se a porta não está em uso
4. Checar logs: `pm2 logs apoiotec`

#### Sem acesso remoto:
1. Verificar firewall do Windows
2. Confirmar IP da máquina
3. Testar conexão local primeiro
4. Verificar configuração do roteador

#### Performance lenta:
1. Verificar recursos da máquina
2. Otimizar consultas do banco
3. Configurar cache se necessário
4. Monitorar logs de erro

### Especificações Recomendadas

#### Hardware mínimo:
- CPU: 2 cores
- RAM: 4GB
- HD: 20GB livres
- Rede: 10Mbps

#### Hardware recomendado:
- CPU: 4+ cores
- RAM: 8GB+
- SSD: 50GB+ livres
- Rede: 50Mbps+

### Notas Importantes

1. **Domínio próprio**: Para usar domínio próprio (ex: apoiotec.com.br), configure DNS para apontar para seu IP público

2. **HTTPS**: Em produção, use certificado SSL/TLS para conexões seguras

3. **Backup**: Configure backup automático do banco de dados

4. **Atualizações**: Mantenha Node.js e PostgreSQL sempre atualizados

5. **Monitoramento**: Configure alertas para indisponibilidade do serviço

6. **Capacidade**: Para muitos usuários simultâneos, considere usar múltiplas instâncias com load balancer