const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'new-call.tsx');

function addEquipmentField() {
    if (!fs.existsSync(FILE_PATH)) {
        console.error("❌ Erro: client/src/pages/new-call.tsx não encontrado.");
        return;
    }

    let content = fs.readFileSync(FILE_PATH, 'utf8');

    // 1. Localiza o campo de Cliente para inserir o de Equipamento logo abaixo
    const clientFieldPattern = /(<FormField[\s\S]*?name="clientId"[\s\S]*?<\/FormItem>[\s\S]*?render=\{[\s\S]*?\}\s*\/>)/;
    
    const equipmentField = `
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400">Equipamento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Servidor Dell, Notebook HP, etc." 
                      className="bg-black/50 border-blue-500/30 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;

    if (content.includes('name="equipment"')) {
        console.log("⚠️ O campo de equipamento já existe no formulário.");
        return;
    }

    if (clientFieldPattern.test(content)) {
        content = content.replace(clientFieldPattern, `$1\n\n${equipmentField}`);
        console.log("✅ Sucesso: Campo 'Equipamento' adicionado ao formulário!");
    } else {
        console.log("❌ Erro: Não consegui localizar o ponto de inserção no formulário.");
    }

    fs.writeFileSync(FILE_PATH, content);
}

addEquipmentField();