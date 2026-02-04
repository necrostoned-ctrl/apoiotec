const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function cleanAndFixTypes() {
    if (!fs.existsSync(ROUTES_PATH)) return;

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // 1. Remove qualquer versão anterior da função para evitar duplicidade
    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n\}/g, '');
    
    // 2. Remove as rotas de ativação duplicadas que ficaram no arquivo
    content = content.replace(/app\.post\("\/api\/activation\/check"[\s\S]*?\}\);/g, '');
    content = content.replace(/app\.post\("\/api\/activation\/activate"[\s\S]*?\}\);/g, '');

    // 3. Define a função com Tipagem Correta (Resolve os erros vermelhos)
    // Título configurado: Apenas o Nome do Cliente
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
    
    const client = await storage.getClient(callData.clientId);
    const clientName = client ? client.name : "Cliente";

    const startTime = new Date(callData.callDate || new Date());
    const endTime = new Date(startTime.getTime() + (3600000));

    await calendar.events.insert({
      calendarId: '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com',
      requestBody: {
        summary: \`🛠️ \${clientName}\`,
        description: \`Equipamento: \${callData.equipment || 'N/A'}\\nProblema: \${callData.description}\\n\\nTécnico: \${creatorName}\`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      },
    });
    console.log("✅ [CALENDAR] Sincronizado!");
  } catch (error: any) {
    console.log("❌ [CALENDAR] Erro:", error.message);
  }
}
`;

    // 4. Injeta a função e as rotas de ativação limpas
    const activationRoutes = `
app.post("/api/activation/check", async (req, res) => {
  res.json({ status: "activated", activated: true });
});

app.post("/api/activation/activate", async (req, res) => {
  res.json({ success: true, activated: true, message: "Sistema Liberado!" });
});
`;

    content = content.replace('export async function registerRoutes', cleanFunction + '\n' + activationRoutes + '\nexport async function registerRoutes');

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("✅ Rotas limpas, erros de tipagem corrigidos e título da agenda ajustado!");
}

cleanAndFixTypes();