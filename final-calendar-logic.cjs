const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function finalCalendarUpdate() {
    if (!fs.existsSync(ROUTES_PATH)) return;

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    const updatedFunction = `
async function createGoogleCalendarEvent(callData, creatorName) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'google-key.json'),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    const client = await storage.getClient(callData.clientId);
    const clientName = client ? client.name : "Cliente";

    let startDateTime = new Date(callData.callDate || new Date());
    if (callData.scheduledDate && callData.scheduledTime) {
      startDateTime = new Date(\`\${callData.scheduledDate}T\${callData.scheduledTime}:00\`);
    }
    const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000));

    await calendar.events.insert({
      calendarId: '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com',
      requestBody: {
        summary: \`🛠️ \${clientName} | \${callData.equipment || 'Equipamento'}\`,
        description: \`Problema: \${callData.description}\\n\\nTécnico: \${creatorName}\`,
        start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Sao_Paulo' },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 } // Notificação 1 hora antes no celular
          ],
        },
      },
    });
    console.log("✅ [CALENDAR] Sincronizado com Alerta e Equipamento!");
  } catch (error) {
    console.log("❌ [CALENDAR] Erro:", error.message);
  }
}
`;

    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n\}/, updatedFunction);
    fs.writeFileSync(ROUTES_PATH, content);
    console.log("✅ server/routes.ts: Lógica de Agenda atualizada.");
}

finalCalendarUpdate();