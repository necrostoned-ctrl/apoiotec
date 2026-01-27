# 📘 Instalação Manual - Windows (Passo a Passo Completo)

**Este guia é para você que teve problemas com o script automático.**

Vamos instalar tudo manualmente, um passo de cada vez. Cada etapa tem verificação para confirmar que funcionou.

---

## ⏱️ Tempo Total Estimado: 30-40 minutos

---

## 📋 ETAPA 1: Instalar Node.js (5 minutos)

Node.js é necessário para rodar a aplicação.

### 1.1 Baixar Node.js

1. **Abra seu navegador** (Chrome, Firefox, Edge)
2. **Acesse:** https://nodejs.org/
3. **Clique no botão verde grande** que diz "Download Node.js (LTS)"
   - LTS significa "versão estável e recomendada"
4. **Salve o arquivo** `node-v20.x.x-x64.msi` (os números podem variar)

### 1.2 Instalar Node.js

1. **Dê duplo clique** no arquivo baixado
2. **Clique "Next"** em todas as telas
3. **Aceite** os termos de licença
4. **Deixe o caminho padrão:** `C:\Program Files\nodejs\`
5. **Clique "Install"**
6. **Digite a senha de administrador** se pedido
7. **Clique "Finish"**

### 1.3 Verificar se Funcionou ✅

1. **Pressione** `Win + R`
2. **Digite:** `cmd`
3. **Pressione Enter**
4. **No terminal preto que abriu, digite:**
   ```cmd
   node --version
   ```
5. **Deve aparecer algo como:** `v20.11.0`

6. **Digite também:**
   ```cmd
   npm --version
   ```
7. **Deve aparecer algo como:** `10.2.4`

**✅ Se aparecerem os números de versão, está funcionando!**

❌ **Se der erro "comando não reconhecido":**
- Feche o terminal
- Abra um NOVO terminal (Win + R, digite `cmd`, Enter)
- Tente novamente

---

## 📋 ETAPA 2: Instalar PostgreSQL (10 minutos)

PostgreSQL é o banco de dados que guarda todas as informações.

### 2.1 Baixar PostgreSQL

1. **Acesse:** https://www.postgresql.org/download/windows/
2. **Clique em** "Download the installer"
3. **Escolha a versão 15** (ou mais recente)
4. **Escolha "Windows x86-64"**
5. **Salve o arquivo** (exemplo: `postgresql-15.5-1-windows-x64.exe`)

### 2.2 Instalar PostgreSQL

1. **Dê duplo clique** no instalador
2. **Clique "Next"** nas primeiras telas
3. **Deixe o caminho padrão:** `C:\Program Files\PostgreSQL\15`
4. **Selecione os componentes** (deixe todos marcados)
5. **Escolha o diretório de dados** (deixe padrão)

**⚠️ ATENÇÃO - PARTE MAIS IMPORTANTE:**

6. **Defina uma senha para o usuário "postgres"**
   - **ANOTE ESSA SENHA!** Você vai precisar dela.
   - Exemplo de senha boa: `Postgres2024!`
   - **Escreva num papel ou bloco de notas**

7. **Porta:** deixe `5432`
8. **Locale:** escolha `Portuguese, Brazil` ou deixe padrão
9. **Clique "Next"** até finalizar
10. **DESMARQUE** a opção "Launch Stack Builder" no final
11. **Clique "Finish"**

### 2.3 Verificar se Funcionou ✅

1. **Pressione** `Win + R`
2. **Digite:** `services.msc`
3. **Pressione Enter**
4. **Procure na lista:** `postgresql-x64-15` (ou versão que instalou)
5. **Deve estar:** "Em execução" (Running)

**✅ Se estiver "Em execução", está funcionando!**

---

## 📋 ETAPA 3: Criar Banco de Dados (5 minutos)

Agora vamos criar o banco específico para o sistema Apoiotec.

### 3.1 Abrir o SQL Shell

1. **Pressione** `Win`
2. **Digite:** `SQL Shell`
3. **Clique em** "SQL Shell (psql)"
4. **Uma janela preta vai abrir** pedindo informações:

```
Server [localhost]:
```
**Apenas pressione Enter** (aceita o padrão)

```
Database [postgres]:
```
**Apenas pressione Enter**

```
Port [5432]:
```
**Apenas pressione Enter**

```
Username [postgres]:
```
**Apenas pressione Enter**

```
Password for user postgres:
```
**Digite a senha que você anotou no passo 2.2** e pressione Enter
- **⚠️ IMPORTANTE:** Você NÃO vai ver o que está digitando (é segurança normal)

### 3.2 Criar Usuário e Banco

Você deve ver agora: `postgres=#`

**Digite ou copie EXATAMENTE cada linha abaixo** e pressione Enter após cada uma:

```sql
CREATE USER apoiotec WITH PASSWORD 'Apoiotec2024!';
```
✅ Deve aparecer: `CREATE ROLE`

```sql
CREATE DATABASE apoiotec OWNER apoiotec;
```
✅ Deve aparecer: `CREATE DATABASE`

```sql
GRANT ALL PRIVILEGES ON DATABASE apoiotec TO apoiotec;
```
✅ Deve aparecer: `GRANT`

```sql
\q
```
Isso sai do SQL Shell.

**⚠️ ANOTE:** 
- **Usuário do banco:** `apoiotec`
- **Senha do banco:** `Apoiotec2024!`
- **Nome do banco:** `apoiotec`

### 3.3 Verificar se Funcionou ✅

1. **Abra SQL Shell novamente** (Win, digite "SQL Shell")
2. Quando pedir:
   - Server: **Enter**
   - Database: **Digite `apoiotec`** e Enter
   - Port: **Enter**
   - Username: **Digite `apoiotec`** e Enter
   - Password: **Digite `Apoiotec2024!`** e Enter

3. **Se conectar sem erro**, está funcionando!
4. **Digite `\q`** para sair

---

## 📋 ETAPA 4: Preparar a Aplicação (5 minutos)

### 4.1 Extrair Arquivos

1. **Localize o arquivo** `apoiotec.zip` que você baixou do Replit
2. **Clique com botão direito** no arquivo
3. **Escolha** "Extrair tudo..."
4. **Escolha o local:** `C:\apoiotec`
5. **Clique "Extrair"**

### 4.2 Criar Arquivo de Configuração

1. **Abra a pasta:** `C:\apoiotec`
2. **Procure o arquivo:** `.env.example`
3. **Clique com botão direito** nele
4. **Escolha:** "Copiar"
5. **Clique com botão direito** em área vazia da pasta
6. **Escolha:** "Colar"
7. **Renomeie o arquivo copiado** de `.env.example - Copy` para `.env`
   - **IMPORTANTE:** O nome final deve ser só `.env` (sem "example", sem "copy")

### 4.3 Editar Configurações

1. **Clique com botão direito** no arquivo `.env`
2. **Escolha:** "Abrir com" > "Bloco de notas"
3. **Localize as linhas que começam com `DATABASE_URL` e `PGPASSWORD`**
4. **Altere** para usar a senha que você criou:

**ANTES:**
```
DATABASE_URL=postgresql://apoiotec:sua_senha_aqui@localhost:5432/apoiotec
PGPASSWORD=sua_senha_aqui
```

**DEPOIS:**
```
DATABASE_URL=postgresql://apoiotec:Apoiotec2024!@localhost:5432/apoiotec
PGPASSWORD=Apoiotec2024!
```

5. **Gerar chave de sessão:**
   - Abra um terminal: Win + R, digite `cmd`, Enter
   - Digite:
     ```cmd
     cd C:\apoiotec
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **Copie o texto** que aparecer (exemplo: `a1b2c3d4e5f6...`)
   - **Cole no arquivo .env** na linha `SESSION_SECRET=`

**Exemplo:**
```
SESSION_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

6. **Salve o arquivo:** Ctrl + S
7. **Feche o Bloco de notas**

---

## 📋 ETAPA 5: Instalar Dependências (5-10 minutos)

### 5.1 Abrir PowerShell

1. **Abra a pasta:** `C:\apoiotec`
2. **Clique na barra de endereço** (onde está escrito C:\apoiotec)
3. **Digite:** `powershell`
4. **Pressione Enter**

**Uma janela azul deve abrir** já dentro da pasta C:\apoiotec

### 5.2 Instalar Pacotes

**Digite este comando:**
```powershell
npm install
```

**Pressione Enter e AGUARDE** (vai demorar 3-5 minutos)

Você vai ver muitas mensagens passando na tela. É normal.

**✅ No final deve aparecer algo como:**
```
added 487 packages in 3m
```

❌ **Se der erro:**
- Verifique se você está na pasta certa: `pwd` deve mostrar `C:\apoiotec`
- Verifique se Node.js está instalado: `node --version`

---

## 📋 ETAPA 6: Compilar o Sistema (3 minutos)

Ainda na mesma janela PowerShell:

```powershell
npm run build
```

**Pressione Enter e AGUARDE** (vai demorar 1-2 minutos)

**✅ No final deve aparecer:**
```
✓ built in XXXXms
```

E deve ter criado uma pasta chamada `dist` dentro de `C:\apoiotec`

**Verificar:**
1. **Abra a pasta** `C:\apoiotec`
2. **Deve ter uma pasta chamada** `dist`
3. **Dentro dela deve ter** `index.js` e outros arquivos

---

## 📋 ETAPA 7: Criar Tabelas do Banco (2 minutos)

Ainda na janela PowerShell:

```powershell
npm run db:push
```

**Pressione Enter**

**✅ Deve aparecer algo como:**
```
✓ Your database is now in sync with your schema
```

❌ **Se der erro de conexão:**
- Verifique a senha no arquivo `.env`
- Verifique se PostgreSQL está rodando (services.msc)

---

## 📋 ETAPA 8: RODAR O SISTEMA! 🚀

Agora temos **DUAS OPÇÕES**. Escolha a que preferir:

---

### 🎯 OPÇÃO A: Rodar Manualmente (MAIS SIMPLES - RECOMENDADO)

**Vantagem:** Simples, sem complicação
**Desvantagem:** Você precisa deixar a janela aberta e iniciar manualmente quando ligar o PC

1. **Na janela PowerShell, digite:**
   ```powershell
   npm run start
   ```

2. **Pressione Enter**

3. **✅ Deve aparecer:**
   ```
   Server running on http://127.0.0.1:5000
   ```

4. **Abra seu navegador** e acesse:
   ```
   http://localhost:5000
   ```

5. **Faça login:**
   - Usuário: `admin`
   - Senha: `admin123`

**🎉 PRONTO! O sistema está funcionando!**

**⚠️ IMPORTANTE:**
- **NÃO FECHE** a janela PowerShell enquanto estiver usando o sistema
- Para **parar** o sistema: pressione `Ctrl + C` na janela PowerShell
- Para **iniciar novamente**:
  1. Abra PowerShell em `C:\apoiotec` (barra de endereço > digite powershell)
  2. Digite: `npm run start`

---

### 🎯 OPÇÃO B: Criar Atalho de Início Rápido (Intermediário)

Vou criar um arquivo `.bat` que você pode dar duplo clique para iniciar.

1. **Abra Bloco de notas**
2. **Cole este texto:**
   ```batch
   @echo off
   title Apoiotec Informatica - Sistema
   cd /d C:\apoiotec
   echo.
   echo ========================================
   echo   APOIOTEC INFORMATICA - SISTEMA
   echo ========================================
   echo.
   echo Iniciando sistema...
   echo.
   call npm run start
   pause
   ```

3. **Salve como:**
   - Nome: `INICIAR_APOIOTEC.bat`
   - Local: `C:\apoiotec`
   - Tipo: "Todos os arquivos"

4. **Feche o Bloco de notas**

**Como usar:**
- **Duplo clique** em `INICIAR_APOIOTEC.bat`
- Uma janela vai abrir e o sistema vai iniciar
- Acesse: `http://localhost:5000`
- Para fechar: feche a janela

**✅ Verificar se funcionou:**
1. Após o script iniciar, deve aparecer: `Server running on http://127.0.0.1:5000`
2. Abra navegador: `http://localhost:5000`
3. Deve carregar a tela de login
4. Login: `admin` / `admin123`

❌ **Se não funcionar:**
- Veja a mensagem de erro na janela
- Consulte seção "Problemas Comuns" abaixo

---

### 🎯 OPÇÃO C: Windows Service (AVANÇADO - Só se Opção A e B não forem suficientes)

**⚠️ ATENÇÃO:** Esta opção é mais complexa. Use apenas se precisar que o sistema inicie automaticamente quando o PC ligar.

#### C.1 Instalar NSSM

1. **Baixe NSSM:** https://nssm.cc/download
2. **Baixe:** `nssm 2.24.zip`
3. **Extraia** em `C:\nssm`
4. **Abra PowerShell como Administrador:**
   - Win + X
   - Escolha "Windows PowerShell (Admin)" ou "Terminal (Admin)"

5. **Adicione ao PATH:**
   ```powershell
   $env:Path += ";C:\nssm\win64"
   [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)
   ```

#### C.2 Verificar Pré-requisitos

**Antes de criar o serviço, verifique:**

```powershell
# Ir para a pasta
cd C:\apoiotec

# Verificar se dist\index.js existe
Test-Path dist\index.js
```

✅ Deve retornar: `True`

❌ **Se retornar False:**
```powershell
npm run build
```

#### C.3 Criar o Serviço

**No PowerShell como Admin:**

```powershell
# Criar serviço
nssm install ApoiotecService "C:\Program Files\nodejs\node.exe" "C:\apoiotec\dist\index.js"

# Configurar pasta de trabalho
nssm set ApoiotecService AppDirectory "C:\apoiotec"

# Configurar logs
nssm set ApoiotecService AppStdout "C:\apoiotec\logs\output.log"
nssm set ApoiotecService AppStderr "C:\apoiotec\logs\error.log"

# Iniciar serviço
nssm start ApoiotecService
```

#### C.4 Verificar se Funcionou ✅

```powershell
Get-Service ApoiotecService
```

Deve mostrar: **Running**

**Testar no navegador:**
1. Abra: `http://localhost:5000`
2. Deve carregar a tela de login
3. Login: `admin` / `admin123`

❌ **Se o status for "Stopped":**
```powershell
# Ver logs de erro
Get-Content C:\apoiotec\logs\error.log -Tail 20
```

Verifique:
- Se PostgreSQL está rodando
- Se as credenciais no .env estão corretas
- Se a porta 5000 está livre

**Comandos úteis:**
```powershell
# Parar
nssm stop ApoiotecService

# Iniciar
nssm start ApoiotecService

# Remover serviço
nssm remove ApoiotecService confirm
```

---

## 🎉 RESUMO FINAL

**Você instalou:**
- ✅ Node.js 20
- ✅ PostgreSQL 15
- ✅ Banco de dados "apoiotec"
- ✅ Sistema Apoiotec Informática

**Para usar o sistema:**
1. **Iniciar:** Use o método que escolheu (A, B ou C)
2. **Acessar:** http://localhost:5000
3. **Login:** admin / admin123
4. **⚠️ ALTERE A SENHA IMEDIATAMENTE!**

---

## ❓ PROBLEMAS COMUNS

### "npm não reconhecido"
**Solução:**
1. Feche o PowerShell
2. Abra um NOVO PowerShell
3. Tente novamente

### "Erro ao conectar banco de dados" ou "password authentication failed"

Este é o erro mais comum! Acontece quando a senha no arquivo `.env` está diferente da senha do banco.

**Solução:**
1. **Verifique se PostgreSQL está rodando:**
   - Pressione `Win + R`
   - Digite: `services.msc`
   - Procure: `postgresql-x64-15`
   - Deve estar "Em execução"

2. **Teste a conexão manualmente:**
   - Abra "SQL Shell (psql)"
   - Quando pedir Database, digite: `apoiotec`
   - Quando pedir Username, digite: `apoiotec`
   - Quando pedir Password, digite a senha que você criou
   - Se conectar sem erro, a senha está correta!

3. **Corrija o arquivo .env:**
   - Abra: `C:\apoiotec\.env` (com Bloco de notas)
   - Localize as linhas:
     ```
     DATABASE_URL=postgresql://apoiotec:SUA_SENHA@localhost:5432/apoiotec
     PGPASSWORD=SUA_SENHA
     ```
   - Substitua `SUA_SENHA` pela senha EXATA que funcionou no SQL Shell
   - **ATENÇÃO:** Se a senha tem caracteres especiais como `!@#$%`, mantenha eles!
   - Salve o arquivo

4. **Teste novamente:**
   ```powershell
   cd C:\apoiotec
   npm run db:push
   ```
   - ✅ Se funcionar: `Your database is now in sync`
   - ❌ Se não funcionar: a senha ainda está errada

**Resetar a senha do banco (última opção):**

Se você esqueceu completamente a senha:

1. Abra SQL Shell como usuário `postgres` (superusuário)
2. Digite:
   ```sql
   ALTER USER apoiotec WITH PASSWORD 'NovaSenhaForte123!';
   ```
3. Atualize o `.env` com a nova senha
4. Teste com `npm run db:push`

### "Porta 5000 em uso"
**Solução:**
```powershell
# Ver o que está usando a porta
netstat -ano | findstr :5000

# Parar o processo (substitua PID pelo número que aparecer)
taskkill /PID numero_do_pid /F
```

### Sistema não abre no navegador
**Solução:**
1. Verifique se o PowerShell mostra "Server running..."
2. Tente: http://127.0.0.1:5000
3. Tente: http://localhost:5000
4. Verifique firewall do Windows

---

## 📞 SENHAS IMPORTANTES ANOTADAS

**Guarde estas informações em local seguro:**

```
=================================
APOIOTEC - CREDENCIAIS
=================================

PostgreSQL Superusuário:
  Usuário: postgres
  Senha: ________________

Banco de Dados Apoiotec:
  Usuário: apoiotec
  Senha: Apoiotec2024!
  Banco: apoiotec

Sistema Web:
  URL: http://localhost:5000
  Usuário: admin
  Senha: admin123
  (ALTERAR APÓS PRIMEIRO LOGIN!)

Chave de Sessão:
  ________________________________

=================================
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Alterar senha do admin** (URGENTE!)
2. **Fazer backup do banco** regularmente
3. **Personalizar configurações** da empresa
4. **Começar a usar o sistema!**

---

**Boa sorte! O sistema está pronto para uso.** 🚀
