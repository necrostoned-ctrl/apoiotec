const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function makeSafe() {
    if (!fs.existsSync(ROUTES_PATH)) return;

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // Altera a função para não dar erro se a credencial sumir
    const safeFunction = `
async function createGoogleCalendarEvent(callData: any, creatorName: string) {
  try {
    const creds = process.env.GOOGLE_CREDENTIALS;
    if (!creds || creds.trim() === "") {
      console.log("⚠️ [CALENDAR] Pulando sincronização: Variável GOOGLE_CREDENTIALS vazia.");
      return;
    }

    let parsedCreds;
    try {
      parsedCreds = JSON.parse(creds);
    } catch (e) {
      console.error("❌ [CALENDAR] Erro de formato no JSON das credenciais.");
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: parsedCreds,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    // ... restante da função ...
`;

    // Localiza a parte do JSON.parse e protege
    content = content.replace(/async function createGoogleCalendarEvent[\s\S]*?const auth = new google\.auth\.GoogleAuth/, safeFunction);

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("✅ Código protegido! O servidor não vai mais cair se a senha faltar.");
}

makeSafe();