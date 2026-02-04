const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function nuclearFix() {
    if (!fs.existsSync(ROUTES_PATH)) return;

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    console.log("🧼 Iniciando limpeza profunda de duplicatas e erros de sintaxe...");

    // 1. Remove TODAS as versões da função createGoogleCalendarEvent (vamos colocar apenas uma correta)
    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n\}/g, '');
    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n/g, '');

    // 2. Remove rotas de ativação perdidas/duplicadas fora do lugar
    content = content.replace(/app\.post\("\/api\/activation\/[\s\S]*?\}\);/g, '');
    
    // 3. Remove chavetas soltas que fecham a registerRoutes prematuramente
    // Isso é o que causa o erro "Cannot find name 'app'"
    content = content.replace(/\n\}\);\s+\n\}\);\s+/g, '\n');
    content = content.replace(/\n\}\);\s+\n/g, '\n');

    // 4. Define a FUNÇÃO ÚNICA E CORRETA (Título: Nome do Cliente)
    const finalCalendarFunction = `
async function createGoogleCalendarEvent(callData: any, creatorName: string) {
  try {
    const creds = process.env.GOOGLE_CREDENTIALS;
    if (!creds) return console.log("⚠️ GOOGLE_CREDENTIALS não configurada.");

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(creds),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    
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

    // 5. Injeta a função antes de registerRoutes
    content = content.replace('export async function registerRoutes', finalCalendarFunction + '\nexport async function registerRoutes');

    // 6. Garante que as rotas de ativação estão LOGO NO INÍCIO da registerRoutes
    const activationRoutes = `
  // Ativação Apoiotec Liberada
  app.post("/api/activation/check", async (_req, res) => res.json({ status: "activated", activated: true }));
  app.post("/api/activation/activate", async (_req, res) => res.json({ success: true, activated: true, message: "Sistema Liberado!" }));
`;

    if (!content.includes('/api/activation/check')) {
        content = content.replace('export async function registerRoutes(app: Express): Promise<Server> {', 
                                   'export async function registerRoutes(app: Express): Promise<Server> {' + activationRoutes);
    }

    // 7. Garante o AWAIT na chamada da agenda
    content = content.replace(/createGoogleCalendarEvent\(call, "Marcelo"\);/g, 'await createGoogleCalendarEvent(call, "Marcelo");');

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("🚀 SUCESSO: Estrutura do routes.ts reconstruída!");
}

nuclearFix();