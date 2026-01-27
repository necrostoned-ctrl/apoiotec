# ============================================
# APOIOTEC - DESINSTALADOR (WINDOWS)
# ============================================

#Requires -RunAsAdministrator

# Configuration
$AppName = "ApoiotecService"
$AppDir = "C:\apoiotec"
$DbName = "apoiotec"
$DbUser = "apoiotec"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║          APOIOTEC INFORMÁTICA - DESINSTALADOR                  ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# Confirmation
Write-Host "⚠ ATENÇÃO: Esta ação irá remover completamente o Apoiotec Informática!" -ForegroundColor Red
Write-Host ""
Write-Host "O que será removido:"
Write-Host "  - Windows Service ($AppName)"
Write-Host "  - Aplicação em $AppDir"
Write-Host "  - Banco de dados PostgreSQL ($DbName)"
Write-Host "  - Usuário do banco ($DbUser)"
Write-Host ""
Write-Host "⚠ BACKUPS NÃO SERÃO REMOVIDOS (verifique $AppDir\backups)" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Deseja continuar? (digite 'SIM' para confirmar)"

if ($confirmation -ne "SIM") {
    Write-Host "Desinstalação cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Iniciando desinstalação..." -ForegroundColor Yellow
Write-Host ""

# Stop and remove service
if (Get-Service $AppName -ErrorAction SilentlyContinue) {
    Write-Host "Parando serviço..." -ForegroundColor Yellow
    Stop-Service $AppName -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Serviço parado" -ForegroundColor Green
    
    if (Get-Command nssm -ErrorAction SilentlyContinue) {
        Write-Host "Removendo serviço..." -ForegroundColor Yellow
        nssm remove $AppName confirm
        Write-Host "✓ Serviço removido" -ForegroundColor Green
    }
}

# Remove application directory
if (Test-Path $AppDir) {
    # Ask about backups
    $backupDir = "$AppDir\backups"
    if ((Test-Path $backupDir) -and (Get-ChildItem $backupDir -ErrorAction SilentlyContinue)) {
        Write-Host ""
        Write-Host "⚠ Foram encontrados backups em $backupDir" -ForegroundColor Yellow
        $keepBackups = Read-Host "Deseja manter os backups? (S/n)"
        
        if ($keepBackups -ne "n" -and $keepBackups -ne "N") {
            Write-Host "Movendo backups para $env:TEMP\apoiotec_backups..." -ForegroundColor Yellow
            $tempBackup = "$env:TEMP\apoiotec_backups"
            New-Item -ItemType Directory -Path $tempBackup -Force | Out-Null
            Copy-Item -Path "$backupDir\*" -Destination $tempBackup -Recurse -Force
            Write-Host "✓ Backups salvos em $tempBackup" -ForegroundColor Green
        }
    }
    
    Write-Host "Removendo diretório da aplicação..." -ForegroundColor Yellow
    Remove-Item -Path $AppDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Aplicação removida" -ForegroundColor Green
}

# Remove database
Write-Host ""
$removeDb = Read-Host "Deseja remover o banco de dados PostgreSQL? (s/N)"

if ($removeDb -eq "s" -or $removeDb -eq "S") {
    Write-Host "Removendo banco de dados..." -ForegroundColor Yellow
    
    # Find PostgreSQL bin directory
    $pgBin = "C:\Program Files\PostgreSQL\15\bin"
    if (-not (Test-Path $pgBin)) {
        $pgBin = (Get-ChildItem "C:\Program Files\PostgreSQL\" -Directory | Sort-Object -Descending | Select-Object -First 1).FullName + "\bin"
    }
    
    if (Test-Path $pgBin) {
        $dropScript = @"
DROP DATABASE IF EXISTS $DbName;
DROP USER IF EXISTS $DbUser;
"@
        $tempSql = "$env:TEMP\apoiotec_drop.sql"
        $dropScript | Out-File -FilePath $tempSql -Encoding UTF8
        
        # Execute (you may need to enter postgres password)
        & "$pgBin\psql.exe" -U postgres -f $tempSql 2>&1 | Out-Null
        Remove-Item $tempSql -ErrorAction SilentlyContinue
        
        Write-Host "✓ Banco de dados removido" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ Banco de dados mantido" -ForegroundColor Yellow
}

# Ask about PostgreSQL and Node.js
Write-Host ""
$removePg = Read-Host "Deseja remover PostgreSQL? (s/N)"
if ($removePg -eq "s" -or $removePg -eq "S") {
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "Removendo PostgreSQL..." -ForegroundColor Yellow
        choco uninstall postgresql15 -y
        Write-Host "✓ PostgreSQL removido" -ForegroundColor Green
    } else {
        Write-Host "⚠ Chocolatey não encontrado. Remova PostgreSQL manualmente pelo Painel de Controle" -ForegroundColor Yellow
    }
}

Write-Host ""
$removeNode = Read-Host "Deseja remover Node.js? (s/N)"
if ($removeNode -eq "s" -or $removeNode -eq "S") {
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "Removendo Node.js..." -ForegroundColor Yellow
        choco uninstall nodejs-lts -y
        Write-Host "✓ Node.js removido" -ForegroundColor Green
    } else {
        Write-Host "⚠ Chocolatey não encontrado. Remova Node.js manualmente pelo Painel de Controle" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              Desinstalação Concluída com Sucesso!              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if (Test-Path "$env:TEMP\apoiotec_backups") {
    Write-Host "📦 Backups salvos em: $env:TEMP\apoiotec_backups" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Obrigado por usar Apoiotec Informática!"
Write-Host ""
