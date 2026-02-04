const fs = require('fs');
const path = require('path');

const FORM_PATH = path.join(process.cwd(), 'client', 'src', 'components', 'insert-call-dialog.tsx');

function fixFrontendForm() {
    if (!fs.existsSync(FORM_PATH)) {
        console.log("❌ Arquivo não encontrado em: " + FORM_PATH);
        return;
    }

    let content = fs.readFileSync(FORM_PATH, 'utf8');

    // Se o campo já estiver lá, não faz nada
    if (content.includes('name="equipment"')) {
        console.log("⚠️ O campo 'equipment' já existe no código.");
        return;
    }

    // Código do campo Equipamento ajustado para o seu padrão Shadcn
    const equipmentField = `
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Notebook Dell, Impressora..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;

    // Injeta logo após o campo do Cliente (clientId)
    const clientFieldPattern = /<FormField[\s\S]*?name="clientId"[\s\S]*?\/>/;
    
    if (clientFieldPattern.test(content)) {
        content = content.replace(clientFieldPattern, (match) => match + '\n' + equipmentField);
        fs.writeFileSync(FORM_PATH, content);
        console.log("✅ Campo 'Equipamento' injetado com sucesso no formulário!");
    } else {
        console.log("❌ Não encontrei o padrão de fechamento do campo clientId para injetar.");
    }
}

fixFrontendForm();