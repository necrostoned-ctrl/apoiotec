const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function repair() {
    if (!fs.existsSync(ROUTES_PATH)) return;
    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    console.log("🔧 Iniciando reparo sintático e ajuste de campos...");

    // 1. Remove a função antiga (do início dela até o export) para limpar o lixo
    const functionStartMarker = "async function createGoogleCalendarEvent";
    const exportMarker = "export async function registerRoutes";
    
    const startIndex = content.indexOf(functionStartMarker);
    const endIndex = content.indexOf(exportMarker);

    if (startIndex === -1 || endIndex === -1) {
        console.log("❌ Não foi possível localizar os marcadores de função no arquivo.");
        return;
    }

    // 2. Nova versão da função com Observações Internas e sintaxe blindada
    const fixedFunction = `async function createGoogleCalendarEvent(callData: any, creatorName: string) {
  try {
    const creds = process.env.GOOGLE_CREDENTIALS;
    if (!creds || creds.length < 10) return;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(creds),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    const client = await storage.getClient(callData.clientId);
    const clientName = client ? client.name : "Cliente #" + callData.clientId;

    await calendar.events.insert({
      calendarId: '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com',
      requestBody: {
        summary: \`🛠️ \${clientName}\`,
        description: \`📝 PROBLEMA: \${callData.description || 'N/A'}\\n\\n🔒 OBSERVAÇÕES INTERNAS:\\n\${callData.internalNotes || 'Sem observações'}\\n\\n👤 TÉCNICO: \${creatorName}\`,
        start: { dateTime: new Date(callData.callDate || new Date()).toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      },
    });
    console.log("✅ [CALENDAR] Sincronizado com Observações!");
  } catch (error: any) {
    console.log("❌ [CALENDAR] Erro:", error.message);
  }
}

`;

    // 3. Substitui o bloco problemático pelo novo
    const newContent = content.substring(0, startIndex) + fixedFunction + content.substring(endIndex);

    fs.writeFileSync(ROUTES_PATH, newContent);
    console.log("🚀 SUCESSO: Sintaxe corrigida e Observações Internas adicionadas!");
}

repair();