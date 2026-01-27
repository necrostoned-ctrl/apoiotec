# Como Usar - Guia Rápido de 4 Passos

## 📦 Passo 1: Exportar do Replit

1. No Replit, clique no menu (três pontinhos) ao lado do nome do projeto
2. Selecione "Download as ZIP"
3. Salve o arquivo `apoiotec.zip` no seu computador

## 💻 Passo 2: Extrair no Computador

**Windows:**
1. Clique com botão direito no arquivo `apoiotec.zip`
2. Selecione "Extrair tudo..."
3. Escolha o local (exemplo: `C:\apoiotec`)
4. Clique em "Extrair"

**Linux:**
```bash
unzip apoiotec.zip
cd apoiotec
```

## ⚙️ Passo 3: Executar Instalador Automático

### Windows 10/11

1. **Abra PowerShell como Administrador:**
   - Pressione `Win + X`
   - Clique em "Windows PowerShell (Admin)" ou "Terminal (Admin)"

2. **Navegue até a pasta extraída:**
   ```powershell
   cd C:\apoiotec
   ```

3. **Execute o instalador:**
   ```powershell
   .\install-windows.ps1
   ```

4. **Aguarde a conclusão** (pode demorar 5-10 minutos)

### Linux (Ubuntu/Debian/CentOS/Fedora)

1. **Abra o Terminal**

2. **Navegue até a pasta extraída:**
   ```bash
   cd ~/apoiotec
   ```

3. **Execute o instalador:**
   ```bash
   sudo ./install-linux.sh
   ```

4. **Aguarde a conclusão** (pode demorar 5-10 minutos)

## ✅ Passo 4: Acessar o Sistema

1. **Abra seu navegador** (Chrome, Firefox, Edge, etc.)

2. **Digite na barra de endereço:**
   ```
   http://localhost:5000
   ```

3. **Faça login com o usuário padrão:**
   - **Usuário:** `setup`
   - **Senha:** `setup123`
   - ⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!
   - 🔒 Este usuário funciona independentemente do banco de dados, garantindo acesso mesmo em caso de problemas

---

## 🎉 Pronto!

O sistema está instalado e rodando! 

**O sistema iniciará automaticamente** quando você ligar o computador.

---

## 📝 Informações Importantes

### Senhas Geradas

O instalador gera automaticamente uma senha forte para o banco de dados. 

**Ao final da instalação**, você verá uma mensagem como:

```
💾 Banco de Dados:
   Nome: apoiotec
   Usuário: apoiotec
   Senha: xK7mP9nQ2wL5jR8vT3hY6bN4cF1aD0eG
   ⚠ Guarde esta senha em local seguro!
```

**Guarde essa senha!** Você vai precisar dela se precisar fazer manutenção no banco de dados.

### Localização dos Arquivos

**Windows:**
- Sistema: `C:\apoiotec`
- Logs: `C:\apoiotec\logs`
- Backups: `C:\apoiotec\backups`

**Linux:**
- Sistema: `/opt/apoiotec`
- Logs: `/opt/apoiotec/logs`
- Backups: `/opt/apoiotec/backups`

---

## 🔧 Comandos Úteis

### Windows (PowerShell como Administrador)

```powershell
# Ver status do serviço
Get-Service ApoiotecService

# Parar o sistema
Stop-Service ApoiotecService

# Iniciar o sistema
Start-Service ApoiotecService

# Reiniciar o sistema
Restart-Service ApoiotecService

# Ver logs
Get-Content C:\apoiotec\logs\service-output.log -Tail 50

# Fazer backup do banco de dados
C:\apoiotec\scripts\backup-database.ps1
```

### Linux

```bash
# Ver status do serviço
sudo systemctl status apoiotec

# Parar o sistema
sudo systemctl stop apoiotec

# Iniciar o sistema
sudo systemctl start apoiotec

# Reiniciar o sistema
sudo systemctl restart apoiotec

# Ver logs
sudo journalctl -u apoiotec -f

# Fazer backup do banco de dados
/opt/apoiotec/scripts/backup-database.sh
```

---

## 🌐 Acessar de Outros Computadores na Rede

Por padrão, o sistema só pode ser acessado do próprio computador (`localhost`).

Para permitir acesso de outros computadores na mesma rede:

### Windows

1. **Edite o arquivo de configuração:**
   ```powershell
   notepad C:\apoiotec\.env
   ```

2. **Altere a linha:**
   ```
   HOST=127.0.0.1
   ```
   Para:
   ```
   HOST=0.0.0.0
   ```

3. **Libere no firewall:**
   ```powershell
   New-NetFirewallRule -DisplayName "Apoiotec Network" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
   ```

4. **Reinicie o serviço:**
   ```powershell
   Restart-Service ApoiotecService
   ```

5. **Descubra o IP do computador:**
   ```powershell
   ipconfig
   ```
   Procure por "Endereço IPv4" (exemplo: `192.168.1.100`)

6. **Acesse de outro PC:**
   ```
   http://192.168.1.100:5000
   ```

### Linux

1. **Edite o arquivo de configuração:**
   ```bash
   sudo nano /opt/apoiotec/.env
   ```

2. **Altere a linha:**
   ```
   HOST=127.0.0.1
   ```
   Para:
   ```
   HOST=0.0.0.0
   ```

3. **Libere no firewall:**
   ```bash
   sudo ufw allow 5000/tcp
   ```

4. **Reinicie o serviço:**
   ```bash
   sudo systemctl restart apoiotec
   ```

5. **Descubra o IP do computador:**
   ```bash
   ip addr show
   ```
   Procure por `inet` (exemplo: `192.168.1.100`)

6. **Acesse de outro PC:**
   ```
   http://192.168.1.100:5000
   ```

---

## ❓ Problemas?

Se algo não funcionar:

1. **Consulte o guia de problemas:** `TROUBLESHOOTING.md`
2. **Veja os guias detalhados:**
   - Windows: `INSTALL_WINDOWS.md`
   - Linux: `INSTALL_LINUX.md`
3. **Verifique os logs** (comandos acima)

---

## 🗑️ Desinstalar

Se precisar remover o sistema completamente:

**Windows:**
```powershell
.\scripts\uninstall.ps1
```

**Linux:**
```bash
sudo ./scripts/uninstall.sh
```

O script perguntará se você quer manter os backups.

---

## 📞 Resumo dos Arquivos

- `COMO_USAR.md` ← **Você está aqui!**
- `README.md` - Visão geral completa do projeto
- `INSTALL_WINDOWS.md` - Instruções detalhadas para Windows
- `INSTALL_LINUX.md` - Instruções detalhadas para Linux
- `TROUBLESHOOTING.md` - Soluções para problemas comuns
- `install-windows.ps1` - Instalador automático Windows
- `install-linux.sh` - Instalador automático Linux
- `scripts/backup-database.ps1` - Backup automático Windows
- `scripts/backup-database.sh` - Backup automático Linux
- `scripts/uninstall.ps1` - Desinstalador Windows
- `scripts/uninstall.sh` - Desinstalador Linux
