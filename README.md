# Apoiotec Informática - Sistema de Gestão de Assistência Técnica

Sistema completo de gestão para assistência técnica, gerenciando clientes, serviços, chamados, orçamentos e transações financeiras.

## 📋 Características

- **Gestão de Clientes**: Cadastro completo com histórico de serviços
- **Orçamentos**: Geração de orçamentos profissionais em PDF
- **Chamados**: Acompanhamento de solicitações de serviço
- **Serviços**: Controle de serviços executados com produtos e materiais
- **Financeiro**: Controle de entradas, saídas e parcelas
- **PDFs Personalizáveis**: Recibos, notas de serviço, orçamentos e relatórios
- **Configurações**: Personalização de fontes, cores e informações da empresa
- **Autenticação**: Sistema de login e controle de usuários

## 🖥️ Requisitos do Sistema

### Windows
- Windows 10 ou 11 (64-bit)
- 4GB RAM (mínimo) / 8GB RAM (recomendado)
- 2GB espaço em disco
- Conexão com internet (para instalação inicial)

### Linux
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / Fedora 35+
- 2GB RAM (mínimo) / 4GB RAM (recomendado)
- 2GB espaço em disco
- Acesso sudo/root

## 📦 Exportar do Replit

### Método 1: Download Direto (Plano Explorer/Staff)
1. No Replit, clique nos três pontos ao lado do nome do projeto
2. Selecione "Download as ZIP"
3. Extraia o arquivo ZIP no seu computador

### Método 2: Git/GitHub
1. No Replit, vá em Tools > Git
2. Conecte com GitHub e faça push do código
3. Clone o repositório no seu computador:
```bash
git clone https://github.com/seu-usuario/apoiotec.git
cd apoiotec
```

### Método 3: Download Manual
1. Selecione todos os arquivos no Replit
2. Clique com botão direito > Download
3. Organize os arquivos na estrutura correta

## 🚀 Instalação

Escolha seu sistema operacional:

### **Windows (10/11)**

**🆕 NOVO: Guia Manual Completo (Recomendado se o script automático falhar)**
📘 **[INSTALACAO_MANUAL_WINDOWS.md](INSTALACAO_MANUAL_WINDOWS.md)** - Guia passo a passo detalhado

**Instalação Rápida com Atalho:**
1. Extraia os arquivos em `C:\apoiotec`
2. Duplo clique em `INICIAR_APOIOTEC.bat`
3. Acesse http://localhost:5000

**Instalação Automática:**
Consulte: [INSTALL_WINDOWS.md](INSTALL_WINDOWS.md)
```powershell
# Execute PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install-windows.ps1
```

### **Linux (Ubuntu/Debian/CentOS/Fedora)**
Consulte: [INSTALL_LINUX.md](INSTALL_LINUX.md)

**Instalação Automática (Recomendado):**
```bash
chmod +x install-linux.sh
sudo ./install-linux.sh
```

## 🔧 Configuração Inicial

Após a instalação, edite o arquivo `.env` com as informações da sua empresa:

```env
# Informações da Empresa
COMPANY_NAME="Apoiotec Informática"
COMPANY_CNPJ="15.292.813.0001-70"
COMPANY_ADDRESS="Rua Maestro Vila Lobos, N° 381, Abolição IV, Mossoró-RN"
COMPANY_PHONE="84988288543 - 84988363828"
COMPANY_EMAIL="contato@apoiotec.com.br"

# Banco de Dados (já configurado pelo instalador)
DATABASE_URL="postgresql://apoiotec:senha_segura@localhost:5432/apoiotec"
```

## 📖 Uso

### Acessar o Sistema
Após instalação, o sistema estará disponível em:
- **URL**: http://localhost:5000
- **Usuário padrão**: admin
- **Senha padrão**: admin123

⚠️ **IMPORTANTE**: Altere a senha padrão em Configurações > Usuários após o primeiro login!

### Gerenciar o Serviço

**Linux:**
```bash
# Verificar status
sudo systemctl status apoiotec

# Parar serviço
sudo systemctl stop apoiotec

# Iniciar serviço
sudo systemctl start apoiotec

# Reiniciar serviço
sudo systemctl restart apoiotec

# Ver logs
sudo journalctl -u apoiotec -f
```

**Windows:**
```powershell
# Verificar status
Get-Service ApoiotecService

# Parar serviço
Stop-Service ApoiotecService

# Iniciar serviço
Start-Service ApoiotecService

# Reiniciar serviço
Restart-Service ApoiotecService
```

## 💾 Backup do Banco de Dados

**Linux:**
```bash
./scripts/backup-database.sh
# Backup salvo em: backups/apoiotec_YYYY-MM-DD_HH-MM-SS.sql
```

**Windows:**
```powershell
.\scripts\backup-database.ps1
# Backup salvo em: backups\apoiotec_YYYY-MM-DD_HH-MM-SS.sql
```

## 🔄 Atualização do Sistema

1. Faça backup do banco de dados
2. Baixe a nova versão do código
3. Pare o serviço
4. Substitua os arquivos (mantendo `.env` e pasta `backups`)
5. Execute:
```bash
# Linux
npm install
npm run db:push
sudo systemctl restart apoiotec

# Windows
npm install
npm run db:push
Restart-Service ApoiotecService
```

## 🗑️ Desinstalação

**Linux:**
```bash
sudo ./scripts/uninstall.sh
```

**Windows:**
```powershell
# Execute como Administrador
.\scripts\uninstall.ps1
```

## 🐛 Resolução de Problemas

Consulte: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Problemas Comuns

**Erro de Conexão com Banco de Dados:**
```bash
# Verificar se PostgreSQL está rodando
# Linux:
sudo systemctl status postgresql
# Windows:
Get-Service postgresql*
```

**Porta 5000 já está em uso:**
```bash
# Edite .env e altere a porta:
PORT=3000
# Reinicie o serviço
```

**Permissões no Linux:**
```bash
# Dar permissões corretas
sudo chown -R apoiotec:apoiotec /opt/apoiotec
sudo chmod +x /opt/apoiotec/server/index.js
```

## 📞 Suporte

Para problemas técnicos:
1. Consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Verifique os logs do sistema
3. Verifique se todos os serviços estão rodando

## 📄 Licença

Sistema desenvolvido para Apoiotec Informática.

## 🏗️ Estrutura do Projeto

```
apoiotec/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   └── utils/       # Utilitários e helpers
├── server/              # Backend Express
│   ├── routes.ts        # Rotas da API
│   └── storage.ts       # Interface de banco de dados
├── shared/              # Código compartilhado
│   └── schema.ts        # Schemas Drizzle
├── scripts/             # Scripts auxiliares
│   ├── backup-database.sh
│   ├── backup-database.ps1
│   ├── uninstall.sh
│   └── uninstall.ps1
├── install-linux.sh     # Instalador Linux
├── install-windows.ps1  # Instalador Windows
├── apoiotec.service     # Systemd service (Linux)
└── .env                 # Configurações (criar a partir de .env.example)
```

## 🔐 Segurança

- Altere a senha padrão após primeiro login
- Mantenha backups regulares do banco de dados
- Use senhas fortes para o banco de dados PostgreSQL
- Configure firewall para bloquear acesso externo à porta 5000 (se necessário)
- Mantenha o sistema operacional e dependências atualizadas

## 🌐 Acesso Remoto (Opcional)

Para acessar o sistema de outros computadores na rede:

1. Configure firewall para permitir porta 5000
2. Edite `.env` e altere:
```env
HOST=0.0.0.0  # Permite acesso de qualquer IP na rede
```
3. Acesse de outros computadores usando: `http://IP_DO_SERVIDOR:5000`

⚠️ **Atenção**: Isso permite acesso de qualquer computador na rede local. Configure autenticação forte!
