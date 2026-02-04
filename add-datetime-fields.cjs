const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'calls.tsx');

function injectDateTimeFields() {
    if (!fs.existsSync(FILE_PATH)) return;

    let content = fs.readFileSync(FILE_PATH, 'utf8');

    // 1. Campo de Data e Hora para o Formulário
    const dateTimeFields = `
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400">Data do Agendamento</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-black/40 border-blue-500/30 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400">Horário</FormLabel>
                    <FormControl>
                      <Input type="time" className="bg-black/40 border-blue-500/30 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>`;

    // Injeta logo após o campo de Cliente (clientId)
    const pattern = /(<FormField[\s\S]*?name="clientId"[\s\S]*?<\/FormItem>[\s\S]*?render=\{[\s\S]*?\}\s*\/>)/;

    if (pattern.test(content) && !content.includes('name="scheduledDate"')) {
        content = content.replace(pattern, `$1\n\n${dateTimeFields}`);
        fs.writeFileSync(FILE_PATH, content);
        console.log("✅ Interface: Campos de Data e Hora adicionados ao modal!");
    } else {
        console.log("⚠️ Campos já existem ou local de inserção não encontrado.");
    }
}

injectDateTimeFields();