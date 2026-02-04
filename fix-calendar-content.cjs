const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function updateCalendarLayout() {
    if (!fs.existsSync(ROUTES_PATH)) return;
    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    console.log("📝 Ajustando layout da task no Google Agenda...");

    const newRequestBody = `
      requestBody: {
        summary: \`🛠️ \${clientName}\`,
        description: \`📝 PROBLEMA: \${callData.description || 'N/A'}\\n\\n🔒 OBSERVAÇÕES INTERNAS:\\n\${callData.internalNotes || 'Sem observações'}\\n\\n👤 TÉCNICO: \${creatorName}\`,
        start: { dateTime: new Date(callData.callDate || new Date()).toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      },`;

    // Localiza o bloco do requestBody e substitui
    content = content.replace(/requestBody: \{[\s\S]*?\},/g, newRequestBody);

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("✅ Layout atualizado! Título limpo e Observações Internas adicionadas.");
}

updateCalendarLayout();