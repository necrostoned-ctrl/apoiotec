# ============================================
# APOIOTEC INFORMÁTICA - INSTALADOR WINDOWS
# ============================================
# Script de instalação automática para Windows 10/11
# Execute como Administrador em PowerShell

#Requires -RunAsAdministrator

# Configuration
$AppName = "ApoiotecService"
$AppDir = "C:\apoiotec"
$AppUser = "apoiotec"
$DbName = "apoiotec"
$DbUser = "apoiotec"
$DbPassword = ""
$PostgresPassword = ""
$SessionSecret = ""

# Colors
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorWarning = "Yellow"
$ColorInfo = "Cyan"

# ============================================
# HELPER FUNCTIONS
# ============================================

function Write-Header {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $ColorSuccess
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $ColorError
}

function Write-WarningMsg {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $ColorWarning
}

function Write-InfoMsg {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $ColorInfo
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Generate-RandomPassword {
    param([int]$Length = 24)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
    $password = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

# ============================================
# INSTALLATION FUNCTIONS
# ============================================

function Install-Chocolatey {
    Write-Header "Instalando Chocolatey"
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Success "Chocolatey já instalado: $(choco --version)"
        return
    }
    
    Write-InfoMsg "Instalando Chocolatey (gerenciador de pacotes)..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Success "Chocolatey instalado"
}

function Install-NodeJS {
    Write-Header "Instalando Node.js 20"
    
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVersion = (node --version).Trim('v').Split('.')[0]
        if ([int]$nodeVersion -ge 20) {
            Write-Success "Node.js já instalado: $(node --version)"
            return
        }
    }
    
    Write-InfoMsg "Instalando Node.js 20 LTS..."
    choco install nodejs-lts -y --force
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Success "Node.js instalado: $(node --version)"
    Write-Success "npm instalado: $(npm --version)"
}

function Install-PostgreSQL {
    Write-Header "Instalando PostgreSQL"
    
    if (Get-Service postgresql* -ErrorAction SilentlyContinue) {
        Write-Success "PostgreSQL já instalado"
    } else {
        Write-InfoMsg "Instalando PostgreSQL 15..."
        
        # Generate postgres superuser password
        if ([string]::IsNullOrEmpty($PostgresPassword)) {
            $PostgresPassword = Generate-RandomPassword
        }
        
        choco install postgresql15 -y --params "/Password:$PostgresPassword"
        
        Write-Success "PostgreSQL instalado"
        Write-InfoMsg "Senha do superusuário postgres: $PostgresPassword"
        Write-WarningMsg "Guarde esta senha em local seguro!"
    }
    
    # Start PostgreSQL service
    $pgService = Get-Service postgresql* | Select-Object -First 1
    if ($pgService) {
        Start-Service $pgService.Name
        Set-Service $pgService.Name -StartupType Automatic
        Write-Success "PostgreSQL iniciado e configurado para início automático"
    }
}

function Configure-Database {
    Write-Header "Configurando Banco de Dados"
    
    # Generate database password
    if ([string]::IsNullOrEmpty($script:DbPassword)) {
        $script:DbPassword = Generate-RandomPassword -Length 32
        Write-InfoMsg "Senha do banco gerada automaticamente (32 caracteres)"
    }
    
    # Generate session secret
    if ([string]::IsNullOrEmpty($script:SessionSecret)) {
        $script:SessionSecret = -join ((1..64) | ForEach-Object { '{0:X}' -f (Get-Random -Maximum 16) })
        Write-InfoMsg "Chave de sessão gerada automaticamente"
    }
    
    # Find PostgreSQL bin directory
    $pgBin = "C:\Program Files\PostgreSQL\15\bin"
    if (-not (Test-Path $pgBin)) {
        $pgBin = (Get-ChildItem "C:\Program Files\PostgreSQL\" -Directory | Sort-Object -Descending | Select-Object -First 1).FullName + "\bin"
    }
    
    $env:Path += ";$pgBin"
    $env:PGPASSWORD = $PostgresPassword
    
    # Create SQL script
    $sqlScript = @"
-- Drop existing if any
DROP DATABASE IF EXISTS $DbName;
DROP USER IF EXISTS $DbUser;

-- Create user and database
CREATE USER $DbUser WITH PASSWORD '$DbPassword';
CREATE DATABASE $DbName OWNER $DbUser;
GRANT ALL PRIVILEGES ON DATABASE $DbName TO $DbUser;
"@
    
    $tempSql = "$env:TEMP\apoiotec_setup.sql"
    $sqlScript | Out-File -FilePath $tempSql -Encoding UTF8
    
    # Execute SQL
    & "$pgBin\psql.exe" -U postgres -f $tempSql 2>&1 | Out-Null
    Remove-Item $tempSql
    
    Write-Success "Banco de dados '$DbName' criado"
    Write-Success "Usuário '$DbUser' criado"
    Write-InfoMsg "Senha do banco: $DbPassword"
    
    # Configure pg_hba.conf
    $pgDataDir = "C:\Program Files\PostgreSQL\15\data"
    if (-not (Test-Path $pgDataDir)) {
        $pgDataDir = (Get-ChildItem "C:\Program Files\PostgreSQL\" -Directory | Sort-Object -Descending | Select-Object -First 1).FullName + "\data"
    }
    
    $pgHbaFile = "$pgDataDir\pg_hba.conf"
    
    # Backup original
    Copy-Item $pgHbaFile "$pgHbaFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    # Add connection rules
    $hbaContent = @"

# Apoiotec local connections
host    $DbName        $DbUser        127.0.0.1/32            md5
host    $DbName        $DbUser        ::1/128                 md5
"@
    
    if (-not (Get-Content $pgHbaFile | Select-String "Apoiotec local connections")) {
        Add-Content -Path $pgHbaFile -Value $hbaContent
        Write-Success "Configuração de autenticação atualizada"
        
        # Reload PostgreSQL
        $pgService = Get-Service postgresql* | Select-Object -First 1
        Restart-Service $pgService.Name
        Write-Success "PostgreSQL reiniciado"
    }
}

function Install-Application {
    Write-Header "Instalando Aplicação"
    
    # Create directories
    if (-not (Test-Path $AppDir)) {
        New-Item -ItemType Directory -Path $AppDir -Force | Out-Null
    }
    New-Item -ItemType Directory -Path "$AppDir\logs" -Force | Out-Null
    New-Item -ItemType Directory -Path "$AppDir\backups" -Force | Out-Null
    
    # Copy files
    $currentDir = Get-Location
    Write-InfoMsg "Copiando arquivos de $currentDir para $AppDir"
    
    # Backup existing .env if it exists
    if (Test-Path "$AppDir\.env") {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item "$AppDir\.env" "$AppDir\.env.backup.$timestamp"
        Write-InfoMsg "Backup do .env existente criado"
    }
    
    $excludeDirs = @('node_modules', '.git', 'logs', 'backups', 'dist')
    Get-ChildItem -Path $currentDir -Exclude $excludeDirs | ForEach-Object {
        if ($_.PSIsContainer) {
            Copy-Item -Path $_.FullName -Destination $AppDir -Recurse -Force
        } else {
            if ($_.Name -ne '.env') {
                Copy-Item -Path $_.FullName -Destination $AppDir -Force
            }
        }
    }
    
    Write-Success "Arquivos copiados"
    
    # Create .env file (always overwrite with correct DB credentials)
    $envContent = @"
NODE_ENV=production
PORT=5000
HOST=127.0.0.1

DATABASE_URL=postgresql://$DbUser`:$($script:DbPassword)@localhost:5432/$DbName
PGHOST=localhost
PGPORT=5432
PGUSER=$DbUser
PGPASSWORD=$($script:DbPassword)
PGDATABASE=$DbName

COMPANY_NAME=Apoiotec Informática
COMPANY_CNPJ=15.292.813.0001-70
COMPANY_ADDRESS=Rua Maestro Vila Lobos, N° 381, Abolição IV, Mossoró-RN
COMPANY_PHONE=84988288543 - 84988363828
COMPANY_EMAIL=albano@hotmail.dk - marcelo@live.no

SESSION_SECRET=$($script:SessionSecret)
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
"@
    
    $envContent | Out-File -FilePath "$AppDir\.env" -Encoding UTF8
    Write-Success "Arquivo .env criado/atualizado com credenciais do banco"
}

function Install-Dependencies {
    Write-Header "Instalando Dependências"
    
    Set-Location $AppDir
    
    Write-InfoMsg "Instalando pacotes npm (isso pode demorar alguns minutos)..."
    npm install
    
    Write-Success "Dependências instaladas"
}

function Build-Application {
    Write-Header "Compilando Aplicação"
    
    Set-Location $AppDir
    
    Write-InfoMsg "Compilando frontend e backend (isso pode demorar alguns minutos)..."
    npm run build
    
    # Verify build artifacts
    if (-not (Test-Path "$AppDir\dist\index.js")) {
        Write-ErrorMsg "Falha na compilação: dist\index.js não foi criado"
        exit 1
    }
    
    Write-Success "Aplicação compilada com sucesso"
}

function Run-Migrations {
    Write-Header "Executando Migrations"
    
    Set-Location $AppDir
    
    npm run db:push
    
    Write-Success "Migrations executadas"
}

function Install-NSSM {
    Write-Header "Instalando NSSM (Windows Service Manager)"
    
    if (Get-Command nssm -ErrorAction SilentlyContinue) {
        Write-Success "NSSM já instalado"
        return
    }
    
    choco install nssm -y
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Success "NSSM instalado"
}

function Install-WindowsService {
    Write-Header "Instalando Windows Service"
    
    # Verify NSSM is installed
    if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) {
        Write-ErrorMsg "NSSM não está instalado. Execute Install-NSSM primeiro."
        exit 1
    }
    
    # Check if service exists
    if (Get-Service $AppName -ErrorAction SilentlyContinue) {
        Write-InfoMsg "Removendo serviço existente..."
        nssm stop $AppName
        nssm remove $AppName confirm
    }
    
    # Find node path
    $nodePath = (Get-Command node).Source
    $scriptPath = "$AppDir\dist\index.js"
    
    # Install service (quotes handle paths with spaces)
    nssm install $AppName "$nodePath" "$scriptPath"
    nssm set $AppName AppDirectory "$AppDir"
    nssm set $AppName AppEnvironmentExtra "NODE_ENV=production"
    nssm set $AppName AppStdout "$AppDir\logs\service-output.log"
    nssm set $AppName AppStderr "$AppDir\logs\service-error.log"
    nssm set $AppName Start SERVICE_AUTO_START
    nssm set $AppName DisplayName "Apoiotec Informática"
    nssm set $AppName Description "Sistema de Gestão de Assistência Técnica"
    
    Write-Success "Serviço Windows instalado e configurado para início automático"
}

function Start-AppService {
    Write-Header "Iniciando Serviço"
    
    Start-Service $AppName
    
    Start-Sleep -Seconds 3
    
    $service = Get-Service $AppName
    if ($service.Status -eq 'Running') {
        Write-Success "Serviço iniciado com sucesso"
    } else {
        Write-ErrorMsg "Falha ao iniciar serviço"
        Write-InfoMsg "Verifique os logs em: $AppDir\logs\"
        exit 1
    }
}

function Verify-Installation {
    Write-Header "Verificando Instalação"
    
    # Check service
    $service = Get-Service $AppName
    if ($service.Status -eq 'Running') {
        Write-Success "Serviço está rodando"
    } else {
        Write-ErrorMsg "Serviço não está rodando"
        return
    }
    
    # Check port
    Start-Sleep -Seconds 2
    $connection = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Success "Porta 5000 está escutando"
    } else {
        Write-WarningMsg "Porta 5000 não está respondendo ainda"
    }
    
    # Test HTTP
    Start-Sleep -Seconds 3
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 5
        Write-Success "Servidor HTTP respondendo"
    } catch {
        Write-WarningMsg "Servidor HTTP ainda não está respondendo"
    }
}

function Show-Summary {
    Write-Header "Instalação Concluída!"
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                  APOIOTEC INFORMÁTICA                          ║" -ForegroundColor Green
    Write-Host "║              Instalação Concluída com Sucesso!                 ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📍 Informações do Sistema:" -ForegroundColor Cyan
    Write-Host "   Diretório: $AppDir"
    Write-Host "   Serviço: $AppName"
    Write-Host ""
    
    Write-Host "🌐 Acesso ao Sistema:" -ForegroundColor Cyan
    Write-Host "   URL: " -NoNewline
    Write-Host "http://localhost:5000" -ForegroundColor Green
    Write-Host "   Usuário padrão: " -NoNewline
    Write-Host "admin" -ForegroundColor Yellow
    Write-Host "   Senha padrão: " -NoNewline
    Write-Host "admin123" -ForegroundColor Yellow
    Write-Host "   " -NoNewline
    Write-Host "⚠ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!" -ForegroundColor Red
    Write-Host ""
    
    Write-Host "💾 Banco de Dados:" -ForegroundColor Cyan
    Write-Host "   Nome: $DbName"
    Write-Host "   Usuário: $DbUser"
    Write-Host "   Senha: " -NoNewline
    Write-Host "$($script:DbPassword)" -ForegroundColor Yellow
    Write-Host "   " -NoNewline
    Write-Host "⚠ Guarde esta senha em local seguro!" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "🔧 Comandos Úteis (PowerShell como Admin):" -ForegroundColor Cyan
    Write-Host "   Status:    " -NoNewline
    Write-Host "Get-Service $AppName" -ForegroundColor Green
    Write-Host "   Parar:     " -NoNewline
    Write-Host "Stop-Service $AppName" -ForegroundColor Green
    Write-Host "   Iniciar:   " -NoNewline
    Write-Host "Start-Service $AppName" -ForegroundColor Green
    Write-Host "   Reiniciar: " -NoNewline
    Write-Host "Restart-Service $AppName" -ForegroundColor Green
    Write-Host "   Logs:      " -NoNewline
    Write-Host "Get-Content $AppDir\logs\service-output.log -Tail 50" -ForegroundColor Green
    Write-Host "   Backup:    " -NoNewline
    Write-Host "$AppDir\scripts\backup-database.ps1" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📖 Documentação:" -ForegroundColor Cyan
    Write-Host "   Instalação Windows: $AppDir\INSTALL_WINDOWS.md"
    Write-Host "   Troubleshooting:    $AppDir\TROUBLESHOOTING.md"
    Write-Host ""
    
    Write-Host "✓ O sistema está rodando e iniciará automaticamente quando o computador ligar!" -ForegroundColor Green
    Write-Host ""
}

# ============================================
# MAIN INSTALLATION PROCESS
# ============================================

function Main {
    Write-Header "APOIOTEC INFORMÁTICA - INSTALADOR WINDOWS"
    
    if (-not (Test-Administrator)) {
        Write-ErrorMsg "Este script deve ser executado como Administrador"
        Write-InfoMsg "Clique com botão direito no PowerShell e selecione 'Executar como Administrador'"
        exit 1
    }
    Write-Success "Verificação de permissões OK"
    
    Install-Chocolatey
    Install-NodeJS
    Install-PostgreSQL
    Configure-Database
    Install-Application
    Install-Dependencies
    Build-Application
    Run-Migrations
    Install-NSSM
    Install-WindowsService
    Start-AppService
    Verify-Installation
    
    Show-Summary
}

# Run main function
Main
