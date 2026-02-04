const fs = require('fs');
const path = require('path');

const CALLS_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'calls.tsx');
const NEW_CALL_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'new-call.tsx');

function rebuildUI() {
    // 1. Limpeza no calls.tsx
    if (fs.existsSync(CALLS_PATH)) {
        let calls = fs.readFileSync(CALLS_PATH, 'utf8');
        // Remove campos de data, hora e equipamento injetados
        calls = calls.replace(/\n\s*<div className="grid grid-cols-2 gap-4">[\s\S]*?name="scheduledTime"[\s\S]*?<\/div>/g, '');
        calls = calls.replace(/\n\s*<FormField[\s\S]*?name="equipment"[\s\S]*?\/>/g, '');
        // Conserta o erro de sintaxe {(... && ( ))}
        calls = calls.replace(/\{\(actionType === "service" \|\| actionType === "invoice"\) && \(\s*\)\}/g, '');
        fs.writeFileSync(CALLS_PATH, calls);
        console.log("✅ calls.tsx: Limpo e restaurado.");
    }

    // 2. Injeção no new-call.tsx
    if (fs.existsSync(NEW_CALL_PATH)) {
        let newCall = fs.readFileSync(NEW_CALL_PATH, 'utf8');
        if (newCall.includes('name="scheduledDate"')) {
            console.log("⚠️ new-call.tsx já possui os campos.");
        } else {
            const fields = `
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400">Equipamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Servidor, Notebook..." className="bg-black/40 border-blue-500/30 text-white" {...field} />
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
                    <FormLabel className="text-blue-400">Data</FormLabel>
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
                    <FormLabel className="text-blue-400">Hora</FormLabel>
                    <FormControl>
                      <Input type="time" className="bg-black/40 border-blue-500/30 text-white" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>`;

            const pattern = /(<FormField[\s\S]*?name="clientId"[\s\S]*?\/FormItem>[\s\S]*?render=\{[\s\S]*?\}\s*\/>)/;
            newCall = newCall.replace(pattern, `$1\n\n${fields}`);
            fs.writeFileSync(NEW_CALL_PATH, newCall);
            console.log("✅ new-call.tsx: Campos adicionados com sucesso.");
        }
    }
}

rebuildUI();