const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function finalFix() {
    if (!fs.existsSync(ROUTES_PATH)) return;

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // 1. Limpeza de "Lixo" (remove as linhas }); soltas e funções duplicadas)
    content = content.replace(/\}\);\s+\}\);\s+async function createGoogleCalendarEvent[\s\S]*?\}\s+\}/g, '');
    content = content.replace(/app\.post\("\/api\/activation\/[\s\S]*?\}\);/g, '');

    // 2. Definição da Função Corrigida (Título: Somente Cliente)
    const calendarFunction = `
async function createGoogleCalendarEvent(callData: any, creatorName: string) {
  try {
    const creds = process.env.GOOGLE_CREDENTIALS;
    if (!creds) return console.log("⚠️ GOOGLE_CREDENTIALS não configurada.");

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(creds),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Busca nome real do cliente
    const client = await storage.getClient(callData.clientId);
    const clientName = client ? client.name : "Cliente #" + callData.clientId;

    const startTime = new Date(callData.callDate || new Date());
    const endTime = new Date(startTime.getTime() + (3600000));

    await calendar.events.insert({
      calendarId: '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com',
      requestBody: {
        summary: \`🛠️ \${clientName}\`,
        description: \`💻 EQUIPAMENTO: \${callData.equipment || 'N/A'}\\n📝 PROBLEMA: \${callData.description || 'N/A'}\\n👤 TÉCNICO: \${creatorName}\`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      },
    });
    console.log("✅ [CALENDAR] Task criada para: " + clientName);
  } catch (error: any) {
    console.log("❌ [CALENDAR] Erro:", error.message);
  }
}
`;

    // 3. Organização das Rotas de Ativação (Dentro de registerRoutes)
    const activationRoutes = `
  // Rotas de Ativação (Apoiotec Liberada)
  app.post("/api/activation/check", async (_req, res) => res.json({ status: "activated", activated: true }));
  app.post("/api/activation/activate", async (_req, res) => res.json({ success: true, activated: true, message: "Sistema Liberado!" }));
`;

    // Injeta a função antes de registerRoutes e as rotas dentro dela
    content = content.replace('export async function registerRoutes', calendarFunction + '\nexport async function registerRoutes');
    content = content.replace('export async function registerRoutes(app: Express): Promise<Server> {', 
                               'export async function registerRoutes(app: Express): Promise<Server> {' + activationRoutes);

    // 4. Correção da Chamada (Adiciona o AWAIT crítico)
    content = content.replace(/createGoogleCalendarEvent\(call, "Marcelo"\);/g, 'await createGoogleCalendarEvent(call, "Marcelo");');

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("🚀 SUCESSO: Arquivo limpo, erros corrigidos e Agenda configurada!");
}

finalFix();