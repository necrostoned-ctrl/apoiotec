const fs = require('fs');
const path = require('path');

function findAndPatch(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            findAndPatch(fullPath);
        } else if (file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Procura o campo de ClientId para usar como referência
            if (content.includes('name="clientId"') && !content.includes('name="equipment"')) {
                console.log(`🎯 Arquivo encontrado: ${fullPath}`);

                const equipmentField = `
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400">Equipamento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Servidor Dell, Notebook HP..." 
                      className="bg-black/50 border-blue-500/30 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;

                // Tenta injetar logo após o fechamento do FormField do clientId
                const pattern = /(<FormField[\s\S]*?name="clientId"[\s\S]*?\/FormItem>[\s\S]*?render=\{[\s\S]*?\}\s*\/>)/;
                
                if (pattern.test(content)) {
                    const newContent = content.replace(pattern, `$1\n\n${equipmentField}`);
                    fs.writeFileSync(fullPath, newContent);
                    console.log("✅ Campo 'Equipamento' injetado com sucesso!");
                    return true;
                }
            }
        }
    }
}

console.log("🔍 Procurando o formulário de chamados...");
const success = findAndPatch(path.join(process.cwd(), 'client', 'src'));

if (!success) {
    console.log("❌ Não encontrei o local exato. Por favor, me diga o nome do arquivo onde você abre o formulário de Novo Chamado.");
} else {
    console.log("🚀 Tudo pronto! Verifique o sistema agora.");
}