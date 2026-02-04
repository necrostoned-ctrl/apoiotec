const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'calls.tsx');

function injectEquipmentField() {
    if (!fs.existsSync(FILE_PATH)) {
        console.error("❌ Erro: Arquivo client/src/pages/calls.tsx não encontrado.");
        return;
    }

    let content = fs.readFileSync(FILE_PATH, 'utf8');

    // Se já existir, não injeta de novo
    if (content.includes('name="equipment"')) {
        console.log("⚠️ O campo 'Equipamento' já parece existir na calls.tsx.");
        return;
    }

    // 1. O código do campo de Equipamento que vamos inserir
    const equipmentField = `
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400 font-bold">Equipamento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Servidor Dell, Notebook HP, Impressora..." 
                      className="bg-black/40 border-blue-500/50 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;

    // 2. Busca o FormField do clientId para usar como ponto de referência
    // Usamos uma busca flexível para encontrar o bloco do clientId
    const pattern = /(<FormField[\s\S]*?name="clientId"[\s\S]*?<\/FormItem>[\s\S]*?render=\{[\s\S]*?\}\s*\/>)/;

    if (pattern.test(content)) {
        const newContent = content.replace(pattern, `$1\n\n${equipmentField}`);
        fs.writeFileSync(FILE_PATH, newContent);
        console.log("✅ Sucesso: Campo 'Equipamento' injetado na calls.tsx!");
    } else {
        console.log("❌ Erro: Não encontrei o local exato do formulário dentro da calls.tsx.");
        console.log("Pode ser que a estrutura do seu formulário use nomes diferentes.");
    }
}

injectEquipmentField();