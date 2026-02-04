const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');
const CALLS_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'calls.tsx');

function cleanup() {
    console.log("🧹 Iniciando a simplificação do sistema...");

    // 1. LIMPEZA NO BACKEND (Google Agenda)
    if (fs.existsSync(ROUTES_PATH)) {
        let routes = fs.readFileSync(ROUTES_PATH, 'utf8');
        
        // Remove a parte do equipamento do título (Summary)
        // De: 🛠️ ${clientName} | ${callData.equipment || 'Sem Equipamento'}
        // Para: 🛠️ ${clientName}
        const summaryOld = /summary: `🛠️ \${clientName} \| \${callData\.equipment \|\| 'Sem Equipamento'}`/;
        const summaryNew = 'summary: `🛠️ ${clientName}`';
        
        if (summaryOld.test(routes)) {
            routes = routes.replace(summaryOld, summaryNew);
            console.log("✅ Google Agenda: Título simplificado para exibir apenas o Cliente.");
        }
        
        fs.writeFileSync(ROUTES_PATH, routes);
    }

    // 2. LIMPEZA NO FRONTEND (UI)
    if (fs.existsSync(CALLS_PATH)) {
        let calls = fs.readFileSync(CALLS_PATH, 'utf8');

        // Remove o bloco FormField que inserimos para o equipamento
        const equipmentBlockPattern = /\n\s*<FormField[\s\S]*?name="equipment"[\s\S]*?<\/FormItem>[\s\S]*?\/>/g;

        if (equipmentBlockPattern.test(calls)) {
            calls = calls.replace(equipmentBlockPattern, '');
            console.log("✅ Interface: Campo de Equipamento removido da calls.tsx.");
        }

        fs.writeFileSync(CALLS_PATH, calls);
    }

    console.log("\n🚀 Tudo pronto! O sistema voltou ao modo ágil e focado no cliente.");
}

cleanup();