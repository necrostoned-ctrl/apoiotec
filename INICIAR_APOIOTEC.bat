@echo off
title Apoiotec Informatica - Sistema de Gestao
color 0A

:: Mudar para o diretorio da aplicacao
cd /d "%~dp0"

:: Banner
echo.
echo ========================================
echo   APOIOTEC INFORMATICA
echo   Sistema de Gestao de Assistencia
echo ========================================
echo.
echo [INFO] Iniciando sistema...
echo [INFO] Aguarde alguns segundos...
echo.

:: Verificar se Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Node.js nao encontrado!
    echo [ERRO] Instale o Node.js antes de continuar.
    echo [ERRO] Baixe em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Verificar se arquivo .env existe
if not exist ".env" (
    color 0C
    echo [ERRO] Arquivo .env nao encontrado!
    echo [ERRO] Execute a instalacao manual primeiro.
    echo [INFO] Consulte: INSTALACAO_MANUAL_WINDOWS.md
    echo.
    pause
    exit /b 1
)

:: Verificar se node_modules existe
if not exist "node_modules" (
    color 0E
    echo [AVISO] Dependencias nao instaladas.
    echo [INFO] Instalando dependencias (pode demorar alguns minutos)...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERRO] Falha ao instalar dependencias!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas!
    echo.
)

:: Verificar se a pasta dist existe
if not exist "dist\index.js" (
    color 0E
    echo [AVISO] Sistema ainda nao foi compilado.
    echo [INFO] Executando compilacao...
    echo.
    call npm run build
    if %errorlevel% neq 0 (
        color 0C
        echo [ERRO] Falha na compilacao!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Compilacao concluida!
    echo.
)

:: Verificar conectividade com banco de dados
echo [INFO] Verificando conexao com banco de dados...
call npm run db:push -- --force >nul 2>nul
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Problema ao conectar com banco de dados.
    echo [INFO] Verifique se PostgreSQL esta rodando.
    echo [INFO] Verifique credenciais no arquivo .env
    echo.
    echo Deseja tentar iniciar mesmo assim? (S/N)
    set /p resposta=
    if /i not "%resposta%"=="S" (
        echo.
        echo [INFO] Operacao cancelada.
        pause
        exit /b 1
    )
)
echo [OK] Banco de dados OK!
echo.

:: Iniciar o sistema
echo [INFO] Iniciando servidor...
echo.
echo ========================================
echo.
echo  Sistema rodando em:
echo  http://localhost:5000
echo.
echo  Usuario: admin
echo  Senha:   admin123
echo.
echo  [!] ALTERE A SENHA APOS O PRIMEIRO LOGIN!
echo.
echo ========================================
echo.
echo [INFO] Para PARAR o sistema: pressione Ctrl+C
echo.

:: Executar o sistema
call npm run start

:: Se chegou aqui, o sistema foi encerrado
echo.
echo [INFO] Sistema encerrado.
echo.
pause
