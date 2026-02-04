const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');
const CALENDAR_ID = '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com';

function updateLayout() {
    if (!fs.existsSync(ROUTES_PATH)) return;

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // Nova versão da função com busca de cliente e layout melhorado
    const newFunction = `
async function createGoogleCalendarEvent(callData, creatorName) {
  console.log("📡 [CALENDAR] Formatando evento para Apoiotec...");
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'google-key.json'),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Busca o nome do cliente no storage (ajustado para sua estrutura)
    const client = await storage.getClient(callData.clientId);
    const clientName = client ? client.name : "Cliente não identificado";

    const startTime = new Date(callData.callDate || new Date());
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

    await calendar.events.insert({
      calendarId: '${CALENDAR_ID}',
      requestBody: {
        summary: \`🛠️ \${clientName} | \${callData.equipment || 'Sem Equipamento'}\`,
        description: \`📝 DESCRIÇÃO:\\n\${callData.description || 'Sem descrição.'}\\n\\n📌 OBSERVAÇÕES INTERNAS:\\n\${callData.internalNotes || 'Nenhuma observação.'}\\n\\n👤 TÉCNICO: \${creatorName}\\n🆔 ID CHAMADO: #\${callData.id}\`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      },
    });
    console.log("✅ [CALENDAR] Evento atualizado criado!");
  } catch (error) {
    console.log("❌ [CALENDAR] Erro no Layout:", error.message);
  }
}
`;

    // Substitui a função antiga pela nova
    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n\}/, newFunction);

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("✅ Layout da Agenda atualizado com Nome do Cliente e Observações!");
}

updateLayout();