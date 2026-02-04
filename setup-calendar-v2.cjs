const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');
const GOOGLE_KEY_PATH = 'google-key.json'; 
const CALENDAR_ID = '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com';

function applyCalendarIntegration() {
    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("❌ Arquivo server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // 1. Injetar Import no topo
    if (!content.includes('import { google } from "googleapis"')) {
        content = 'import { google } from "googleapis";\n' + content;
    }

    // 2. Função de criação de evento com suporte ao Nome do Usuário
    const calendarFunction = `
async function createGoogleCalendarEvent(callData, creatorName) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), '${GOOGLE_KEY_PATH}'),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    
    // Define início e fim (1 hora de duração padrão)
    const startTime = new Date(callData.date || new Date());
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

    await calendar.events.insert({
      calendarId: '${CALENDAR_ID}',
      requestBody: {
        summary: \`🛠️ Chamado: \${callData.clientName || 'Cliente'} - \${callData.equipment || 'Equipamento'}\`,
        description: \`Problema: \${callData.description || 'N/A'}\\n\\n👤 Criado por: \${creatorName}\\n📅 Data de Entrada: \${new Date(callData.date).toLocaleString('pt-BR')}\`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        status: 'confirmed',
      },
    });
    console.log("📅 [GOOGLE CALENDAR] Evento sincronizado com sucesso.");
  } catch (error) {
    console.error("❌ [GOOGLE CALENDAR] Erro na sincronização:", error.message);
  }
}
`;

    if (!content.includes('async function createGoogleCalendarEvent')) {
        content = content.replace('export async function registerRoutes', calendarFunction + '\nexport async function registerRoutes');
    }

    // 3. Modificar a rota POST /api/calls para disparar a função
    const callRouteRegex = /(const call = await storage\.createCall\(req\.body\);)/;
    const injection = `$1\n    \n    // Automação Google Agenda Apoiotec\n    const technicalUser = req.body.createdBy || "Técnico Apoiotec";\n    createGoogleCalendarEvent(call, technicalUser);`;

    if (content.match(callRouteRegex) && !content.includes('createGoogleCalendarEvent(call')) {
        content = content.replace(callRouteRegex, injection);
        console.log("✅ Rota /api/calls atualizada.");
    }

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("🚀 Tudo pronto! Reinicie o sistema com 'npm run dev'.");
}

applyCalendarIntegration();