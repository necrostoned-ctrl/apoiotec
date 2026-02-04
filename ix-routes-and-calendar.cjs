const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function updateCalendarTitleOnly() {
    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("❌ Arquivo server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // Remove a parte do equipamento do título (Summary)
    // De: summary: `🛠️ ${clientName} | ${callData.equipment || 'Equipamento'}`
    // Para: summary: `🛠️ ${clientName}`
    const oldSummary = /summary: `🛠️ \${clientName} \| \${callData\.equipment \|\| 'Equipamento'}`/g;
    const newSummary = 'summary: `🛠️ ${clientName}`';

    if (oldSummary.test(content)) {
        content = content.replace(oldSummary, newSummary);
        fs.writeFileSync(ROUTES_PATH, content);
        console.log("✅ Sucesso: O título agora exibirá apenas o nome do cliente.");
    } else {
        console.log("⚠️ Padrão de título não encontrado ou já alterado.");
    }
}

updateCalendarTitleOnly();