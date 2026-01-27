# ============================================
# APOIOTEC - BACKUP DO BANCO DE DADOS (WINDOWS)
# ============================================

# Load environment variables
$envFile = "C:\apoiotec\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Configuration
$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { ".\backups" }
$DbName = if ($env:PGDATABASE) { $env:PGDATABASE } else { "apoiotec" }
$DbUser = if ($env:PGUSER) { $env:PGUSER } else { "apoiotec" }
$DbPassword = $env:PGPASSWORD
$RetentionDays = if ($env:BACKUP_RETENTION_DAYS) { [int]$env:BACKUP_RETENTION_DAYS } else { 30 }

# Find PostgreSQL bin directory
$pgBin = "C:\Program Files\PostgreSQL\15\bin"
if (-not (Test-Path $pgBin)) {
    $pgBin = (Get-ChildItem "C:\Program Files\PostgreSQL\" -Directory | Sort-Object -Descending | Select-Object -First 1).FullName + "\bin"
}

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Generate filename with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $BackupDir "apoiotec_$timestamp.sql"

Write-Host "Iniciando backup do banco de dados..." -ForegroundColor Yellow
Write-Host "Banco: $DbName"
Write-Host "Arquivo: $backupFile"

# Set password environment variable
$env:PGPASSWORD = $DbPassword

# Create backup
try {
    & "$pgBin\pg_dump.exe" -U $DbUser -h localhost $DbName | Out-File -FilePath $backupFile -Encoding UTF8
    
    # Compress backup
    Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip" -Force
    Remove-Item $backupFile
    $backupFile = "$backupFile.zip"
    
    # Get file size
    $size = (Get-Item $backupFile).Length / 1MB
    $sizeFormatted = "{0:N2} MB" -f $size
    
    Write-Host "✓ Backup criado com sucesso!" -ForegroundColor Green
    Write-Host "  Arquivo: $backupFile"
    Write-Host "  Tamanho: $sizeFormatted"
    
    # Clean old backups
    if ($RetentionDays -gt 0) {
        Write-Host "Removendo backups antigos (mais de $RetentionDays dias)..." -ForegroundColor Yellow
        $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
        Get-ChildItem -Path $BackupDir -Filter "apoiotec_*.sql.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item
        $remaining = (Get-ChildItem -Path $BackupDir -Filter "apoiotec_*.sql.zip").Count
        Write-Host "✓ Backups mantidos: $remaining" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Erro ao criar backup!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Clear password
    Remove-Item Env:\PGPASSWORD
}
