# Troubleshooting - Apoiotec Informática

Guia completo de resolução de problemas e perguntas frequentes.

## 📋 Índice

- [Problemas de Instalação](#problemas-de-instalação)
- [Problemas de Banco de Dados](#problemas-de-banco-de-dados)
- [Problemas de Serviço](#problemas-de-serviço)
- [Problemas de Rede/Acesso](#problemas-de-redeacesso)
- [Problemas de Performance](#problemas-de-performance)
- [Perguntas Frequentes (FAQ)](#perguntas-frequentes-faq)

---

## Problemas de Instalação

### Linux: "Node.js não encontrado" após instalação

**Sintoma:** Comando `node` não é reconhecido após instalação.

**Solução:**
```bash
# Recarregar shell
source ~/.bashrc

# Ou abrir novo terminal
exec bash

# Verificar instalação
which node
node --version
```

### Windows: "O termo 'node' não é reconhecido"

**Sintoma:** PowerShell não reconhece comando `node`.

**Solução:**
```powershell
# Reiniciar PowerShell/Terminal

# Verificar PATH
$env:Path -split ';' | Select-String "nodejs"

# Se não estiver no PATH, adicionar manualmente:
$env:Path += ";C:\Program Files\nodejs\"

# Para permanente, editar variáveis de ambiente do sistema
```

### Erro: "Permission denied" ao executar instalador

**Linux:**
```bash
chmod +x install-linux.sh
sudo ./install-linux.sh
```

**Windows:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Instalação interrompida / Erro no meio do processo

**Solução:**
1. Execute o script de desinstalação primeiro:
   ```bash
   # Linux
   sudo ./scripts/uninstall.sh
   
   # Windows (como Admin)
   .\scripts\uninstall.ps1
   ```

2. Execute o instalador novamente:
   ```bash
   # Linux
   sudo ./install-linux.sh
   
   # Windows (como Admin)
   .\install-windows.ps1
   ```

---

## Problemas de Banco de Dados

### Erro: "ECONNREFUSED" ou "Connection refused"

**Sintoma:** Aplicação não consegue conectar ao PostgreSQL.

**Diagnóstico:**

**Linux:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar porta
sudo ss -tlnp | grep 5432

# Testar conexão manual
psql -h localhost -U apoiotec -d apoiotec
```

**Windows:**
```powershell
# Verificar serviço
Get-Service postgresql*

# Verificar porta
Get-NetTCPConnection -LocalPort 5432

# Testar conexão
$env:PGPASSWORD = "sua_senha"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U apoiotec -d apoiotec
```

**Soluções:**

1. **PostgreSQL não está rodando:**
   ```bash
   # Linux
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Windows
   Start-Service postgresql-x64-15
   Set-Service postgresql-x64-15 -StartupType Automatic
   ```

2. **Firewall bloqueando:**
   ```bash
   # Linux
   sudo ufw allow 5432/tcp
   
   # Windows
   New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
   ```

3. **Configuração de autenticação incorreta:**
   ```bash
   # Linux: Editar pg_hba.conf
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   
   # Adicionar/verificar:
   local   apoiotec        apoiotec                                md5
   host    apoiotec        apoiotec        127.0.0.1/32            md5
   
   # Reiniciar
   sudo systemctl restart postgresql
   ```

### Erro: "password authentication failed"

**Sintoma:** Senha do banco de dados incorreta.

**Solução:**

1. **Verificar senha no .env:**
   ```bash
   # Linux
   cat /opt/apoiotec/.env | grep DATABASE_URL
   
   # Windows
   Get-Content C:\apoiotec\.env | Select-String DATABASE_URL
   ```

2. **Resetar senha do usuário PostgreSQL:**
   ```bash
   # Linux
   sudo -u postgres psql
   
   # Windows (psql como postgres)
   # No prompt SQL:
   ALTER USER apoiotec WITH PASSWORD 'nova_senha_forte';
   \q
   ```

3. **Atualizar .env com nova senha:**
   ```bash
   # Linux
   sudo nano /opt/apoiotec/.env
   
   # Windows
   notepad C:\apoiotec\.env
   
   # Alterar linha:
   DATABASE_URL=postgresql://apoiotec:nova_senha_forte@localhost:5432/apoiotec
   ```

4. **Reiniciar serviço:**
   ```bash
   # Linux
   sudo systemctl restart apoiotec
   
   # Windows
   Restart-Service ApoiotecService
   ```

### Banco de dados corrompido

**Sintoma:** Erros aleatórios, dados inconsistentes.

**Solução:**

1. **Parar serviço:**
   ```bash
   # Linux
   sudo systemctl stop apoiotec
   
   # Windows
   Stop-Service ApoiotecService
   ```

2. **Restaurar backup:**
   ```bash
   # Linux
   sudo -u postgres psql -d apoiotec -f backups/apoiotec_2025-01-15_02-00-00.sql.gz
   
   # Windows
   $env:PGPASSWORD = "senha"
   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U apoiotec -d apoiotec -f "backups\apoiotec_2025-01-15_02-00-00.sql.zip"
   ```

3. **Se não houver backup, recriar banco:**
   ```bash
   # Criar novo banco
   sudo -u postgres psql
   DROP DATABASE apoiotec;
   CREATE DATABASE apoiotec OWNER apoiotec;
   \q
   
   # Executar migrations
   cd /opt/apoiotec  # ou C:\apoiotec no Windows
   npm run db:push
   ```

---

## Problemas de Serviço

### Linux: Serviço não inicia

**Diagnóstico:**
```bash
# Ver status detalhado
sudo systemctl status apoiotec

# Ver logs
sudo journalctl -u apoiotec -n 100

# Ver logs em tempo real
sudo journalctl -u apoiotec -f
```

**Soluções comuns:**

1. **Porta já em uso:**
   ```bash
   # Descobrir o que está usando porta 5000
   sudo ss -tlnp | grep 5000
   
   # Matar processo (substitua PID)
   sudo kill -9 PID
   
   # Ou alterar porta no .env
   sudo nano /opt/apoiotec/.env
   # Mudar PORT=5000 para PORT=3000
   sudo systemctl restart apoiotec
   ```

2. **Permissões incorretas:**
   ```bash
   sudo chown -R apoiotec:apoiotec /opt/apoiotec
   sudo chmod +x /opt/apoiotec/server/index.js
   sudo systemctl restart apoiotec
   ```

3. **Dependências faltando:**
   ```bash
   cd /opt/apoiotec
   sudo -u apoiotec npm install
   sudo systemctl restart apoiotec
   ```

### Windows: Serviço não inicia

**Diagnóstico:**
```powershell
# Ver status
Get-Service ApoiotecService

# Ver logs
Get-Content C:\apoiotec\logs\service-error.log -Tail 50

# Ver eventos
Get-EventLog -LogName Application -Source ApoiotecService -Newest 20
```

**Soluções comuns:**

1. **Porta já em uso:**
   ```powershell
   # Descobrir processo
   Get-NetTCPConnection -LocalPort 5000
   
   # Matar processo (substitua PID)
   Stop-Process -Id PID -Force
   
   # Ou alterar porta
   notepad C:\apoiotec\.env
   # Mudar PORT=5000 para PORT=3000
   Restart-Service ApoiotecService
   ```

2. **Serviço configurado incorretamente:**
   ```powershell
   # Remover e recriar serviço
   nssm stop ApoiotecService
   nssm remove ApoiotecService confirm
   
   # Reinstalar (seguir passos do INSTALL_WINDOWS.md)
   ```

### Serviço não inicia automaticamente com o sistema

**Linux:**
```bash
# Verificar se está habilitado
sudo systemctl is-enabled apoiotec

# Habilitar
sudo systemctl enable apoiotec

# Verificar dependências
sudo systemctl list-dependencies apoiotec
```

**Windows:**
```powershell
# Verificar configuração
nssm dump ApoiotecService

# Configurar início automático
nssm set ApoiotecService Start SERVICE_AUTO_START
```

---

## Problemas de Rede/Acesso

### Não consigo acessar http://localhost:5000

**Diagnóstico:**

1. **Verificar se serviço está rodando:**
   ```bash
   # Linux
   sudo systemctl status apoiotec
   
   # Windows
   Get-Service ApoiotecService
   ```

2. **Verificar se porta está escutando:**
   ```bash
   # Linux
   sudo ss -tlnp | grep 5000
   
   # Windows
   Get-NetTCPConnection -LocalPort 5000
   ```

3. **Testar com curl:**
   ```bash
   # Linux
   curl http://localhost:5000
   
   # Windows
   Invoke-WebRequest -Uri http://localhost:5000
   ```

**Soluções:**

1. **Firewall bloqueando (mesmo localmente):**
   ```bash
   # Linux
   sudo ufw allow 5000/tcp
   
   # Windows
   New-NetFirewallRule -DisplayName "Apoiotec Local" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
   ```

2. **HOST configurado incorretamente:**
   ```bash
   # Verificar .env
   # Deve ser HOST=127.0.0.1 ou HOST=0.0.0.0
   
   # Linux
   sudo nano /opt/apoiotec/.env
   
   # Windows
   notepad C:\apoiotec\.env
   
   # Reiniciar serviço
   ```

### Não consigo acessar de outro computador na rede

**Pré-requisitos:**
1. HOST deve ser `0.0.0.0` no .env
2. Firewall deve permitir porta 5000
3. Computadores devem estar na mesma rede

**Configuração:**

**Linux:**
```bash
# 1. Editar .env
sudo nano /opt/apoiotec/.env
# Alterar: HOST=0.0.0.0

# 2. Configurar firewall
sudo ufw allow 5000/tcp

# 3. Descobrir IP
ip addr show | grep inet

# 4. Reiniciar serviço
sudo systemctl restart apoiotec
```

**Windows:**
```powershell
# 1. Editar .env
notepad C:\apoiotec\.env
# Alterar: HOST=0.0.0.0

# 2. Configurar firewall
New-NetFirewallRule -DisplayName "Apoiotec Network" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow

# 3. Descobrir IP
ipconfig | Select-String "IPv4"

# 4. Reiniciar serviço
Restart-Service ApoiotecService
```

**Testar de outro PC:**
```
http://IP_DO_SERVIDOR:5000
```

---

## Problemas de Performance

### Sistema lento / Travando

**Causas comuns:**

1. **Banco de dados grande sem índices:**
   ```bash
   # Verificar tamanho do banco
   sudo -u postgres psql
   \l+
   \dt+
   ```

2. **Memória RAM insuficiente:**
   ```bash
   # Linux
   free -h
   
   # Windows
   Get-Counter '\Memory\Available MBytes'
   ```

3. **Muitas transações não processadas:**
   - Limpar dados antigos pelo sistema
   - Fazer backup e arquivar dados históricos

**Soluções:**

1. **Aumentar recursos do PostgreSQL:**
   ```bash
   # Linux: Editar postgresql.conf
   sudo nano /etc/postgresql/*/main/postgresql.conf
   
   # Ajustar:
   shared_buffers = 256MB
   effective_cache_size = 1GB
   
   # Reiniciar
   sudo systemctl restart postgresql
   ```

2. **Limpar logs antigos:**
   ```bash
   # Linux
   sudo journalctl --vacuum-time=7d
   
   # Windows
   # Limpar logs em C:\apoiotec\logs\
   ```

### PDFs demorando muito para gerar

**Causas:**
- Tamanho de fonte muito grande (>16pt)
- Muitos itens na tabela
- Imagens/logo muito grandes

**Soluções:**
1. Reduzir tamanho de fonte em Configurações > PDF Font Size
2. Limitar número de itens por relatório
3. Otimizar logo da empresa (max 200KB, formato PNG/JPG)

---

## Perguntas Frequentes (FAQ)

### Como alterar a porta do sistema?

1. Editar arquivo `.env`:
   ```bash
   # Linux
   sudo nano /opt/apoiotec/.env
   
   # Windows
   notepad C:\apoiotec\.env
   ```

2. Alterar linha `PORT=5000` para nova porta (ex: `PORT=3000`)

3. Reiniciar serviço:
   ```bash
   # Linux
   sudo systemctl restart apoiotec
   
   # Windows
   Restart-Service ApoiotecService
   ```

### Como criar backups automáticos?

**Linux (crontab):**
```bash
# Editar crontab do root
sudo crontab -e

# Adicionar linha (backup diário às 02:00):
0 2 * * * /opt/apoiotec/scripts/backup-database.sh
```

**Windows (Agendador de Tarefas):**
1. Abrir "Agendador de Tarefas" (Task Scheduler)
2. Criar Tarefa Básica
3. Nome: "Backup Apoiotec"
4. Gatilho: Diariamente às 02:00
5. Ação: Iniciar programa
   - Programa: `powershell.exe`
   - Argumentos: `-File "C:\apoiotec\scripts\backup-database.ps1"`
   - Diretório: `C:\apoiotec`

### Como restaurar um backup?

```bash
# Linux
sudo systemctl stop apoiotec
gunzip -c backups/apoiotec_2025-01-15_02-00-00.sql.gz | sudo -u postgres psql -d apoiotec
sudo systemctl start apoiotec

# Windows
Stop-Service ApoiotecService
Expand-Archive backups\apoiotec_2025-01-15_02-00-00.sql.zip -DestinationPath temp
$env:PGPASSWORD = "senha"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U apoiotec -d apoiotec -f temp\apoiotec_2025-01-15_02-00-00.sql
Start-Service ApoiotecService
```

### Como resetar senha do admin?

**Opção 1 - Via banco de dados:**
```sql
-- Conectar ao banco
sudo -u postgres psql -d apoiotec

-- Resetar senha (exemplo: nova senha = admin123)
UPDATE users SET password = '$2a$10$hash_aqui' WHERE username = 'admin';
```

**Opção 2 - Recriar usuário:**
1. Parar serviço
2. Conectar ao banco
3. Executar:
   ```sql
   DELETE FROM users WHERE username = 'admin';
   ```
4. Iniciar serviço (criará usuário padrão novamente)

### Como atualizar o sistema?

1. **Fazer backup:**
   ```bash
   # Linux
   /opt/apoiotec/scripts/backup-database.sh
   
   # Windows
   C:\apoiotec\scripts\backup-database.ps1
   ```

2. **Baixar nova versão do código**

3. **Parar serviço:**
   ```bash
   # Linux
   sudo systemctl stop apoiotec
   
   # Windows
   Stop-Service ApoiotecService
   ```

4. **Substituir arquivos** (manter .env e pasta backups)

5. **Atualizar dependências:**
   ```bash
   npm install
   ```

6. **Executar migrations:**
   ```bash
   npm run db:push
   ```

7. **Reiniciar serviço:**
   ```bash
   # Linux
   sudo systemctl start apoiotec
   
   # Windows
   Start-Service ApoiotecService
   ```

### Onde ficam os logs?

**Linux:**
```bash
# Logs do serviço (systemd)
sudo journalctl -u apoiotec -f

# Logs da aplicação
/opt/apoiotec/logs/
```

**Windows:**
```powershell
# Logs da aplicação
C:\apoiotec\logs\service-output.log
C:\apoiotec\logs\service-error.log

# Logs de eventos do Windows
Get-EventLog -LogName Application -Source ApoiotecService
```

### Como desinstalar completamente?

```bash
# Linux
sudo ./scripts/uninstall.sh

# Windows (como Administrador)
.\scripts\uninstall.ps1
```

---

## 📞 Ainda com Problemas?

Se o problema persistir:

1. **Verifique os logs** detalhadamente
2. **Teste em modo desenvolvimento:**
   ```bash
   # Parar serviço
   # Executar manualmente:
   cd /opt/apoiotec  # ou C:\apoiotec
   npm run dev
   # Veja os erros no console
   ```

3. **Verifique requisitos do sistema** (RAM, espaço em disco)

4. **Reinstale** usando o script de desinstalação seguido do instalador

5. **Consulte a documentação:**
   - README.md
   - INSTALL_LINUX.md ou INSTALL_WINDOWS.md

---

## 🔐 Segurança

- Use senhas fortes para PostgreSQL e SESSION_SECRET
- Mantenha backups regulares e seguros
- Atualize o sistema operacional e dependências
- Se expor à rede, configure firewall apropriadamente
- Altere senha padrão do admin imediatamente após instalação
