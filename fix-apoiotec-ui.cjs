const fs = require('fs');
const path = require('path');

const CALLS_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'calls.tsx');
const NEW_CALL_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'new-call.tsx');

function runFix() {
    // 1. Limpando o erro de sintaxe no calls.tsx
    if (fs.existsSync(CALLS_PATH)) {
        let callsContent = fs.readFileSync(CALLS_PATH, 'utf8');
        // Remove o bloco quebrado que causou o erro no Vite
        callsContent = callsContent.replace(/\{\(actionType === "service" \|\| actionType === "invoice"\) && \(\s*\)\}/g, '');
        fs.writeFileSync(CALLS_PATH, callsContent);
        console.log("✅ Sucesso: Arquivo calls.tsx limpo e erro de sintaxe removido.");
    }

    // 2. Injetando campos no new-call.tsx
    if (fs.existsSync(NEW_CALL_PATH)) {
        let newCallContent = fs.readFileSync(NEW_CALL_PATH, 'utf8');
        
        if (!newCallContent.includes('name="scheduledDate"')) {
            const fieldsToInject = `
            {/* Campos adicionados para Google Agenda - Apoiotec */}
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400 font-bold">Equipamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Servidor Dell, PC Gamer, etc." className="bg-black/40 border-blue-500/30" {...field} />
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
                      <Input type="date" className="bg-black/40 border-blue-500/30" {...field} />
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
                      <Input type="time" className="bg-black/40 border-blue-500/30" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>`;

            // Procura o campo de clientId para injetar logo abaixo
            const insertionPoint = /(<FormField[\s\S]*?name="clientId"[\s\S]*?\/FormItem>[\s\S]*?render=\{[\s\S]*?\}\s*\/>)/;
            
            if (insertionPoint.test(newCallContent)) {
                newCallContent = newCallContent.replace(insertionPoint, `$1\n\n${fieldsToInject}`);
                fs.writeFileSync(NEW_CALL_PATH, newCallContent);
                console.log("✅ Sucesso: Campos de Equipamento, Data e Hora adicionados ao new-call.tsx.");
            } else {
                console.log("❌ Erro: Não encontrei o campo clientId no new-call.tsx para injetar.");
            }
        } else {
            console.log("⚠️ Aviso: Os campos já existem no new-call.tsx.");
        }
    }
}

runFix();