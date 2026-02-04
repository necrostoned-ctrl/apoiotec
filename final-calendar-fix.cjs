const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');
const GOOGLE_KEY_PATH = 'google-key.json'; 
const CALENDAR_ID = '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com';

function finalInjection() {
    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("❌ Erro: server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // 1. Injetar Import no topo (sem duplicar)
    if (!content.includes('import { google } from "googleapis"')) {
        content = 'import { google } from "googleapis";\n' + content;
    }

    // 2. Definir a Função de Sincronização
    const calendarFunction = `
async function createGoogleCalendarEvent(callData, creatorName) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), '${GOOGLE_KEY_PATH}'),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Usa a data do chamado ou a atual
    const startTime = new Date(callData.callDate || callData.createdAt || new Date());
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

    await calendar.events.insert({
      calendarId: '${CALENDAR_ID}',
      requestBody: {
        summary: \`🛠️ Chamado: \${callData.equipment || 'Equipamento'} - ID #\${callData.id}\`,
        description: \`📝 Descrição: \${callData.description}\\n\\n👤 Técnico Responsável: \${creatorName}\\n📍 Status: \${callData.status}\`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      },
    });
    console.log("📅 [GOOGLE CALENDAR] Sincronizado com sucesso!");
  } catch (error) {
    console.log("❌ [GOOGLE CALENDAR] Erro na Agenda:", error.message);
  }
}
`;

    // Remove injeções incompletas anteriores e adiciona a nova
    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n\}/, '');
    if (!content.includes('async function createGoogleCalendarEvent')) {
        content = content.replace('export async function registerRoutes', calendarFunction + '\nexport async function registerRoutes');
    }

    // 3. Injeção Cirúrgica na Rota de Chamados
    // Procuramos pelo log que você mandou no terminal: console.log("Chamado criado:", call);
    const targetLog = /console\.log\("Chamado criado:",\s*call\);/g;

    if (targetLog.test(content)) {
        if (!content.includes('createGoogleCalendarEvent(call')) {
            // Injeta logo após o log de criação
            content = content.replace(targetLog, 'console.log("Chamado criado:", call);\n    \n    // Início da Automação Google Agenda\n    const userNameForCalendar = "Marcelo"; // Fallback conforme seu log\n    createGoogleCalendarEvent(call, userNameForCalendar);');
            console.log("✅ Sucesso: Sincronização injetada após a criação do chamado!");
        } else {
            console.log("⚠️ Aviso: O código de sincronização já existe no arquivo.");
        }
    } else {
        console.log("❌ Erro: Não encontrei a linha 'console.log(\"Chamado criado:\", call);'.");
        console.log("Verifique se o seu routes.ts usa outro nome para a variável do chamado.");
    }

    fs.writeFileSync(ROUTES_PATH, content);
}

finalInjection();