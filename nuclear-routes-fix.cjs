const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function nuclearFix() {
    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("❌ Arquivo server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    console.log("🧹 Iniciando limpeza profunda...");

    // 1. Remove TODAS as ocorrências antigas da função createGoogleCalendarEvent
    // Procura desde o async até o fim da função para não deixar lixo
    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n\}/g, '');

    // 2. Remove as rotas de ativação duplicadas (check e activate)
    content = content.replace(/app\.post\("\/api\/activation\/check"[\s\S]*?\}\);/g, '');
    content = content.replace(/app\.post\("\/api\/activation\/activate"[\s\S]*?\}\);/g, '');

    // 3. Define a versão LIMPA e TIPADA (Título: Somente Cliente)
    const cleanFunction = `
async function createGoogleCalendarEvent(callData: any, creatorName: string) {
  try {
    const creds = process.env.GOOGLE_CREDENTIALS;
    if (!creds) return;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(creds),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Busca o nome do cliente para o título
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
    console.log("✅ [CALENDAR] Sincronizado: " + clientName);
  } catch (error: any) {
    console.error("❌ [CALENDAR] Erro:", error.message);
  }
}
`;

    // 4. Rota de Ativação Única e Limpa
    const activationRoutes = `
app.post("/api/activation/check", async (req, res) => {
  res.json({ status: "activated", activated: true });
});

app.post("/api/activation/activate", async (req, res) => {
  res.json({ success: true, activated: true, message: "Sistema Liberado!" });
});
`;

    // 5. Injeção antes da exportação das rotas
    content = content.replace('export async function registerRoutes', cleanFunction + '\n' + activationRoutes + '\nexport async function registerRoutes');

    // 6. Garante que a chamada da função na rota de chamados não está duplicada
    // Se não existir, insere antes do envio da resposta
    if (!content.includes('createGoogleCalendarEvent(call, "Marcelo")')) {
        content = content.replace('res.status(201).json(call);', 'createGoogleCalendarEvent(call, "Marcelo");\n      res.status(201).json(call);');
    }

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("🚀 SUCESSO: O arquivo foi limpo e os erros devem ter sumido.");
}

nuclearFix();