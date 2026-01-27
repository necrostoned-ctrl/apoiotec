@echo off
title Criar Atalho na Area de Trabalho
color 0B

echo.
echo ========================================
echo   CRIAR ATALHO NA AREA DE TRABALHO
echo ========================================
echo.

:: Obter caminho atual
set SCRIPT_DIR=%~dp0
set SHORTCUT_TARGET=%SCRIPT_DIR%INICIAR_APOIOTEC.bat

:: Verificar se o arquivo existe
if not exist "%SHORTCUT_TARGET%" (
    color 0C
    echo [ERRO] Arquivo INICIAR_APOIOTEC.bat nao encontrado!
    echo [ERRO] Certifique-se de que este script esta na mesma pasta.
    echo.
    pause
    exit /b 1
)

:: Criar atalho usando PowerShell
echo [INFO] Criando atalho na area de trabalho...
echo.

powershell -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Apoiotec Sistema.lnk'); $Shortcut.TargetPath = '%SHORTCUT_TARGET%'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Sistema de Gestao Apoiotec Informatica'; $Shortcut.Save()"

if %errorlevel% equ 0 (
    color 0A
    echo [OK] Atalho criado com sucesso!
    echo [INFO] Verifique sua area de trabalho.
    echo.
    echo Agora voce pode:
    echo - Dar duplo clique no atalho para iniciar o sistema
    echo - Arrastar o atalho para a barra de tarefas
    echo.
) else (
    color 0C
    echo [ERRO] Falha ao criar atalho.
    echo [INFO] Isso pode acontecer por restricoes de seguranca do Windows.
    echo.
    echo Solucao:
    echo 1. Execute este script como Administrador (botao direito, "Executar como administrador")
    echo 2. Ou crie o atalho manualmente:
    echo    - Clique direito na area de trabalho
    echo    - Novo ^> Atalho
    echo    - Caminho: %SHORTCUT_TARGET%
    echo.
)

pause
