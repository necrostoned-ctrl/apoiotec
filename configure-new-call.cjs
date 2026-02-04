const fs = require('fs');
const path = require('path');

const NEW_CALL_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'new-call.tsx');
const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function finalSetup() {
    console.log("🛠️ Iniciando configuração da página New Call...");

    // 1. AJUSTE NA INTERFACE (new-call.tsx)
    if (fs.existsSync(NEW_CALL_PATH)) {
        let content = fs.readFileSync(NEW_CALL_PATH, 'utf8');
        
        const fields = `
            {/* Campos Apoiotec: Equipamento, Data e Hora */}
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400 font-bold">Equipamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Servidor Dell, Desktop..." className="bg-black/40 border-blue-500/30 text-white" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400 font-bold">Data do Atendimento</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-black/40 border-blue-500/30 text-white" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400 font-bold">Horário</FormLabel>
                    <FormControl>
                      <Input type="time" className="bg-black/40 border-blue-500/30 text-white" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>`;

        const pattern = /(<FormField[\s\S]*?name="clientId"[\s\S]*?\/FormItem>[\s\S]*?render=\{[\s\S]*?\}\s*\/>)/;
        
        if (pattern.test(content) && !content.includes('name="scheduledDate"')) {
            content = content.replace(pattern, `$1\n\n${fields}`);
            fs.writeFileSync(NEW_CALL_PATH, content);
            console.log("✅ Interface: Campos adicionados ao new-call.tsx.");
        }
    }

    // 2. AJUSTE NA LÓGICA (routes.ts) - Com Título e Notificação
    if (fs.existsSync(ROUTES_PATH)) {
        let routes = fs.readFileSync(ROUTES_PATH, 'utf8');
        const calendarFunction = `
async function createGoogleCalendarEvent(callData, creatorName) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'google-key.json'),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    const client = await storage.getClient(callData.clientId);
    const clientName = client ? client.name : "Cliente";

    // Define data/hora (ou usa a atual se vazio)
    let startDateTime = new Date(callData.callDate || new Date());
    if (callData.scheduledDate && callData.scheduledTime) {
      startDateTime = new Date(\`\${callData.scheduledDate}T\${callData.scheduledTime}:00\`);
    }
    const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000));

    await calendar.events.insert({
      calendarId: '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com',
      requestBody: {
        summary: \`🛠️ \${clientName} | \${callData.equipment || 'Equipamento'}\`,
        description: \`Descrição: \${callData.description}\\n\\nTécnico: \${creatorName}\`,
        start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Sao_Paulo' },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 60 }],
        },
      },
    });
    console.log("✅ [CALENDAR] Evento criado com Equipamento e Alerta!");
  } catch (error) {
    console.log("❌ [CALENDAR] Erro:", error.message);
  }
}
`;
        routes = routes.replace(/async function createGoogleCalendarEvent[\s\S]*?\}\n\}/, calendarFunction);
        fs.writeFileSync(ROUTES_PATH, routes);
        console.log("✅ Backend: Lógica de Agenda atualizada.");
    }
}

finalSetup();