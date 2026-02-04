const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function fixRoutes() {
    if (!fs.existsSync(ROUTES_PATH)) return;

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // 1. Remove TODA a zona problemática (espaços, }); soltos e funções duplicadas)
    // Vamos reconstruir o bloco entre o fim do DEFAULT_SETUP_USER e o início do registerRoutes
    const startMarker = 'const DEFAULT_SETUP_USER = {';
    const endMarker = 'export async function registerRoutes';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        console.log("❌ Não foi possível localizar os pontos de ancoragem no ficheiro.");
        return;
    }

    // Mantemos o objeto DEFAULT_SETUP_USER e limpamos o resto até registerRoutes
    const beforePart = content.substring(0, content.indexOf('};', startIndex) + 2);
    const afterPart = content.substring(endIndex);

    // 2. Definimos a lógica limpa e o título da agenda (Apenas Cliente)
    const cleanLogic = `

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
    console.log("✅ [CALENDAR] Sincronizado!");
  } catch (error: any) {
    console.error("❌ [CALENDAR] Erro:", error.message);
  }
}

`;

    // 3. Montamos o ficheiro e movemos as rotas de ativação para DENTRO de registerRoutes
    let newContent = beforePart + cleanLogic + afterPart;
    
    // Injetamos as rotas de ativação logo após a abertura do registerRoutes
    const activationInside = `
  // Ativação Automática
  app.post("/api/activation/check", async (_req, res) => {
    return res.json({ status: "activated", activated: true });
  });

  app.post("/api/activation/activate", async (_req, res) => {
    return res.json({ success: true, activated: true, message: "Sistema Liberado!" });
  });
`;

    newContent = newContent.replace('export async function registerRoutes(app: Express): Promise<Server> {', 
                                   'export async function registerRoutes(app: Express): Promise<Server> {' + activationInside);

    fs.writeFileSync(ROUTES_PATH, newContent);
    console.log("✅ Ficheiro routes.ts corrigido com precisão!");
}

fixRoutes();