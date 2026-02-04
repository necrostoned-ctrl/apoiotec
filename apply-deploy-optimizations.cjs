const fs = require('fs');
const path = require('path');

const FLY_TOML_PATH = path.join(process.cwd(), 'fly.toml');
const DOCKERFILE_PATH = path.join(process.cwd(), 'Dockerfile');

function optimizeDeploy() {
    console.log("🚀 Iniciando otimizações para o ambiente Fly.io...");

    // 1. AJUSTE NO FLY.TOML
    if (fs.existsSync(FLY_TOML_PATH)) {
        let flyContent = fs.readFileSync(FLY_TOML_PATH, 'utf8');
        
        // Remove a linha redundante de memória fora do bloco [[vm]]
        flyContent = flyContent.replace(/^memory\s*=\s*['"]256mb['"]\s*$/m, "# memory removido (duplicado)");
        
        fs.writeFileSync(FLY_TOML_PATH, flyContent);
        console.log("✅ fly.toml: Configuração de memória limpa e organizada.");
    }

    // 2. AJUSTE NO DOCKERFILE (SWAP + STARTUP)
    if (fs.existsSync(DOCKERFILE_PATH)) {
        let dockerContent = fs.readFileSync(DOCKERFILE_PATH, 'utf8');

        // Adiciona a criação da Swap antes do comando final
        const swapLogic = `
# --- OTIMIZAÇÃO APOIOTEC: SWAP PARA PREVENIR OOM ---
RUN fallocate -l 512M /swapfile && chmod 600 /swapfile && mkswap /swapfile
# --------------------------------------------------
`;
        
        if (!dockerContent.includes('/swapfile')) {
            // Insere antes do CMD
            dockerContent = dockerContent.replace(/CMD\s*\[/, swapLogic + '\nCMD [');
            
            // Ajusta o CMD para ativar a Swap antes de subir o Node
            // Nota: O comando CMD precisa ser alterado para shell form para usar o '&&'
            dockerContent = dockerContent.replace(
                /CMD\s*\["node",\s*"dist\/index\.js"\]/, 
                'CMD swapon /swapfile && node dist/index.js'
            );
        }

        fs.writeFileSync(DOCKERFILE_PATH, dockerContent);
        console.log("✅ Dockerfile: Swap de 512MB configurada e comando de inicialização ajustado.");
    }

    console.log("\n🔥 Otimizações aplicadas! Agora o restore terá uma margem de segurança de RAM.");
}

optimizeDeploy();