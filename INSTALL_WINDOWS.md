# Instalação no Windows - Apoiotec Informática

Guia completo de instalação para Windows 10 e Windows 11.

## 📋 Pré-requisitos

- Windows 10 (64-bit) ou Windows 11
- Direitos de Administrador
- Conexão com internet
- 4GB RAM (mínimo) / 8GB RAM (recomendado)
- 2GB espaço em disco

## 🚀 Instalação Rápida (Recomendado)

### Passo 1: Baixar o Código do Replit

1. No Replit, baixe o projeto como ZIP
2. Extraia o arquivo ZIP em `C:\apoiotec` (ou outra pasta de sua preferência)

### Passo 2: Executar Instalador Automático

1. **Abra PowerShell como Administrador:**
   - Pressione `Win + X`
   - Clique em "Windows PowerShell (Admin)" ou "Terminal (Admin)"

2. **Configure política de execução:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Navegue até a pasta do projeto:**
   ```powershell
   cd C:\apoiotec
   ```

4. **Execute o instalador:**
   ```powershell
   .\install-windows.ps1
   ```

O instalador vai:
- ✅ Verificar se você é Administrador
- ✅ Instalar Chocolatey (gerenciador de pacotes)
- ✅ Instalar Node.js 20
- ✅ Instalar PostgreSQL 15
- ✅ Criar banco de dados "apoiotec"
- ✅ Instalar todas as dependências npm
- ✅ Configurar variáveis de ambiente
- ✅ Executar migrations do banco
- ✅ Instalar como Windows Service
- ✅ Configurar início automático

### Passo 3: Verificar Instalação

```powershell
# Verificar se o serviço está rodando
Get-Service ApoiotecService

# Ver logs do serviço
Get-EventLog -LogName Application -Source ApoiotecService -Newest 10

# Acessar o sistema
# Abra navegador em: http://localhost:5000
```

---

## 📖 Instalação Manual Detalhada

Se preferir instalar manualmente ou o instalador automático falhou:

### Passo 1: Instalar Node.js 20

**Opção A - Download Direto:**
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (Long Term Support) - atualmente v20.x
3. Execute o instalador
4. Siga as instruções (deixe opções padrão)
5. Reinicie o PowerShell/Terminal

**Opção B - Via Chocolatey:**
```powershell
# Instalar Chocolatey primeiro
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Node.js
choco install nodejs-lts -y

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

### Passo 2: Instalar PostgreSQL

**Opção A - Download Direto:**
1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe o instalador da versão 15 ou superior
3. Execute o instalador
4. **Durante instalação:**
   - Senha do superusuário (postgres): anote essa senha!
   - Porta: deixe 5432 (padrão)
   - Locale: Portuguese, Brazil
5. Marque opção para adicionar ao PATH

**Opção B - Via Chocolatey:**
```powershell
choco install postgresql -y
```

### Passo 3: Configurar Banco de Dados

```powershell
# Abrir prompt do PostgreSQL
# No menu iniciar, procure "SQL Shell (psql)"
# Ou execute:
psql -U postgres

# No prompt do PostgreSQL, execute:
CREATE USER apoiotec WITH PASSWORD 'SuaSenhaForteAqui123!';
CREATE DATABASE apoiotec OWNER apoiotec;
GRANT ALL PRIVILEGES ON DATABASE apoiotec TO apoiotec;

# Sair
\q
```

**Configurar autenticação:**

1. Localize o arquivo `pg_hba.conf`:
   ```
   C:\Program Files\PostgreSQL\15\data\pg_hba.conf
   ```

2. Abra como Administrador no Notepad

3. Adicione estas linhas no final:
   ```
   # Apoiotec local connections
   host    apoiotec        apoiotec        127.0.0.1/32            md5
   host    apoiotec        apoiotec        ::1/128                 md5
   ```

4. Reinicie PostgreSQL:
   ```powershell
   Restart-Service postgresql-x64-15
   ```

### Passo 4: Configurar Aplicação

```powershell
# Navegar até o diretório do projeto
cd C:\apoiotec

# Copiar arquivo de exemplo
Copy-Item .env.example .env

# Editar configurações
notepad .env
```

**Configure o arquivo .env:**
```env
NODE_ENV=production
PORT=5000
HOST=127.0.0.1

# Altere a senha para a que você criou no passo 3
DATABASE_URL=postgresql://apoiotec:SuaSenhaForteAqui123!@localhost:5432/apoiotec

# Configure informações da empresa
COMPANY_NAME=Apoiotec Informática
COMPANY_CNPJ=15.292.813.0001-70
COMPANY_ADDRESS=Rua Maestro Vila Lobos, N° 381, Abolição IV, Mossoró-RN
COMPANY_PHONE=84988288543 - 84988363828
COMPANY_EMAIL=contato@apoiotec.com.br

# Gere uma chave secreta aleatória (copie a saída do comando abaixo)
# SESSION_SECRET=cole_aqui_a_chave_gerada
```

**Gerar chave secreta:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copie o resultado e cole no .env na linha SESSION_SECRET
```

### Passo 5: Instalar Dependências

```powershell
# Instalar pacotes npm
npm install

# Executar migrations do banco de dados
npm run db:push
```

### Passo 6: Instalar NSSM (para Windows Service)

```powershell
# Via Chocolatey
choco install nssm -y

# Ou baixe manualmente:
# https://nssm.cc/download
# Extraia e adicione ao PATH
```

### Passo 7: Criar Windows Service

```powershell
# Variáveis
$serviceName = "ApoiotecService"
$appPath = "C:\apoiotec"
$nodePath = (Get-Command node).Source
$scriptPath = "$appPath\server\index.js"

# Criar serviço com NSSM
nssm install $serviceName $nodePath $scriptPath

# Configurar diretório de trabalho
nssm set $serviceName AppDirectory $appPath

# Configurar variáveis de ambiente
nssm set $serviceName AppEnvironmentExtra "NODE_ENV=production"

# Configurar logs
nssm set $serviceName AppStdout "$appPath\logs\service-output.log"
nssm set $serviceName AppStderr "$appPath\logs\service-error.log"

# Configurar início automático
nssm set $serviceName Start SERVICE_AUTO_START

# Iniciar serviço
Start-Service $serviceName

# Verificar status
Get-Service $serviceName
```

### Passo 8: Verificar Instalação

```powershell
# Ver status do serviço
Get-Service ApoiotecService

# Testar conexão
Invoke-WebRequest -Uri http://localhost:5000

# Abrir navegador
Start-Process "http://localhost:5000"
```

---

## 🔧 Gerenciamento do Serviço

```powershell
# Ver status
Get-Service ApoiotecService

# Parar serviço
Stop-Service ApoiotecService

# Iniciar serviço
Start-Service ApoiotecService

# Reiniciar serviço
Restart-Service ApoiotecService

# Ver propriedades do serviço
Get-Service ApoiotecService | Format-List *

# Ver logs
Get-Content C:\apoiotec\logs\service-output.log -Tail 50
Get-Content C:\apoiotec\logs\service-error.log -Tail 50

# Ver eventos do sistema
Get-EventLog -LogName Application -Source ApoiotecService -Newest 20
```

## 💾 Backup do Banco de Dados

```powershell
# Backup manual
.\scripts\backup-database.ps1

# Backups são salvos em: backups\apoiotec_YYYY-MM-DD_HH-MM-SS.sql

# Agendar backup diário (Agendador de Tarefas)
# 1. Abra "Agendador de Tarefas" (Task Scheduler)
# 2. Criar Tarefa Básica
# 3. Nome: Backup Apoiotec
# 4. Gatilho: Diariamente às 02:00
# 5. Ação: Iniciar programa
# 6. Programa: powershell.exe
# 7. Argumentos: -File "C:\apoiotec\scripts\backup-database.ps1"
# 8. Diretório: C:\apoiotec
```

## 🔄 Restaurar Backup

```powershell
# Parar serviço
Stop-Service ApoiotecService

# Restaurar backup
$env:PGPASSWORD = "SuaSenhaAqui"
psql -U apoiotec -d apoiotec -f "backups\apoiotec_2025-01-15_02-00-00.sql"

# Iniciar serviço
Start-Service ApoiotecService
```

## 🌐 Acesso Remoto (Opcional)

Para acessar de outros computadores na rede:

```powershell
# 1. Editar .env
notepad C:\apoiotec\.env

# Alterar HOST
HOST=0.0.0.0

# 2. Configurar Firewall
New-NetFirewallRule -DisplayName "Apoiotec HTTP" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow

# 3. Reiniciar serviço
Restart-Service ApoiotecService

# 4. Descobrir IP local
ipconfig | Select-String "IPv4"

# Acesse de outros PCs: http://SEU_IP:5000
```

## 🗑️ Desinstalação

```powershell
# Execute como Administrador
.\scripts\uninstall.ps1
```

## ⚠️ Problemas Comuns

### Erro: "Este computador não tem permissões para executar scripts"

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "Porta 5000 já está em uso"

```powershell
# Descobrir o que está usando a porta
Get-NetTCPConnection -LocalPort 5000

# Matar processo (substitua PID pelo número encontrado)
Stop-Process -Id PID -Force

# Ou altere a porta no .env
notepad C:\apoiotec\.env
# Mude PORT=5000 para PORT=3000
Restart-Service ApoiotecService
```

### Erro: "ECONNREFUSED" ao conectar no banco

```powershell
# Verificar se PostgreSQL está rodando
Get-Service postgresql*

# Se não estiver, iniciar
Start-Service postgresql-x64-15

# Testar conexão manual
$env:PGPASSWORD = "SuaSenha"
psql -U apoiotec -d apoiotec -h localhost

# Verificar configurações
notepad C:\apoiotec\.env
```

### Serviço não inicia

```powershell
# Ver logs de erro
Get-Content C:\apoiotec\logs\service-error.log

# Verificar configuração do serviço
nssm dump ApoiotecService

# Reinstalar serviço
nssm remove ApoiotecService confirm
# Depois refaça o Passo 7
```

### Erro: "Node não encontrado"

```powershell
# Verificar instalação
node --version

# Se não encontrar, adicionar ao PATH
$env:Path += ";C:\Program Files\nodejs\"

# Para permanente, editar variáveis de ambiente do sistema
```

## 🔄 Atualização do Sistema

```powershell
# 1. Fazer backup
.\scripts\backup-database.ps1

# 2. Parar serviço
Stop-Service ApoiotecService

# 3. Baixar nova versão e substituir arquivos
# (mantenha .env e pasta backups)

# 4. Atualizar dependências
npm install

# 5. Executar migrations
npm run db:push

# 6. Reiniciar serviço
Start-Service ApoiotecService
```

## 📞 Suporte

Consulte: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 💡 Dicas

- **Logs**: Sempre verifique os logs em `C:\apoiotec\logs\` quando houver problemas
- **Backups**: Configure backups automáticos diários
- **Segurança**: Use senhas fortes para PostgreSQL e SESSION_SECRET
- **Firewall**: Se ativar acesso remoto, configure regras de firewall apropriadas
- **Antivírus**: Adicione exceção para `C:\apoiotec` se houver problemas de performance
