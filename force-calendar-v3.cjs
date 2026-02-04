const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');
const GOOGLE_KEY_PATH = 'google-key.json'; 
const CALENDAR_ID = '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com';

function forceCleanAndInject() {
    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("❌ Erro: server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    console.log("🧹 Limpando injeções antigas...");
    // Remove imports, funções e chamadas anteriores para evitar lixo
    content = content.replace(/import { google } from "googleapis";\n/g, '');
    content = content.replace(/\/\/ Automação Google Agenda[\s\S]*?createGoogleCalendarEvent\(call,.*?\);/g, '');
    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n\}/g, '');

    // 1. Injetar Import
    content = 'import { google } from "googleapis";\n' + content;

    // 2. Injetar a Função
    const calendarFunction = `
async function createGoogleCalendarEvent(callData, creatorName) {
  console.log("📡 [CALENDAR] Tentando sincronizar...");
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), '${GOOGLE_KEY_PATH}'),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    const startTime = new Date(callData.callDate || callData.createdAt || new Date());
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

    await calendar.events.insert({
      calendarId: '${CALENDAR_ID}',
      requestBody: {
        summary: \`🛠️ Chamado: \${callData.equipment || 'Equipamento'} - ID #\${callData.id}\`,
        description: \`Problema: \${callData.description}\\n\\n👤 Técnico: \${creatorName}\`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      },
    });
    console.log("✅ [CALENDAR] Sincronizado!");
  } catch (error) {
    console.log("❌ [CALENDAR] Erro detalhado:", error.message);
  }
}
`;
    content = content.replace('export async function registerRoutes', calendarFunction + '\nexport async function registerRoutes');

    // 3. Injeção na Rota POST /api/calls
    // Vamos procurar o final da rota, onde o servidor envia o status 201
    const finalResponsePattern = /res\.status\(201\)\.json\(call\);/g;

    if (finalResponsePattern.test(content)) {
        content = content.replace(finalResponsePattern, 
            '// Automação Google Agenda\n    createGoogleCalendarEvent(call, "Marcelo");\n    res.status(201).json(call);');
        console.log("✅ Sucesso: Sincronização injetada no final da rota!");
    } else {
        console.log("❌ Erro: Não encontrei o ponto de retorno da rota (201).");
    }

    fs.writeFileSync(ROUTES_PATH, content);
}

forceCleanAndInject();