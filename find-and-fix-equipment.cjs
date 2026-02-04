const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(process.cwd(), 'client', 'src', 'components');

function findAndFix() {
    if (!fs.existsSync(COMPONENTS_DIR)) {
        console.log("❌ Pasta de componentes não encontrada: " + COMPONENTS_DIR);
        return;
    }

    const files = fs.readdirSync(COMPONENTS_DIR);
    let targetFile = null;

    // Procura o arquivo que contém o campo "clientId" (o seletor de cliente)
    for (const file of files) {
        if (file.endsWith('.tsx')) {
            const content = fs.readFileSync(path.join(COMPONENTS_DIR, file), 'utf8');
            if (content.includes('name="clientId"') && content.includes('<FormField')) {
                targetFile = file;
                break;
            }
        }
    }

    if (!targetFile) {
        console.log("❌ Não encontrei o arquivo do formulário de chamados em " + COMPONENTS_DIR);
        return;
    }

    console.log(`🎯 Arquivo identificado: ${targetFile}`);
    const filePath = path.join(COMPONENTS_DIR, targetFile);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('name="equipment"')) {
        console.log("⚠️ O campo 'equipment' já existe neste arquivo.");
        return;
    }

    // Código do campo Equipamento
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

    // Injeta após o fechamento do campo clientId
    const clientIdPattern = /<FormField[\s\S]*?name="clientId"[\s\S]*?\/>/;
    const clientIdPatternFull = /<FormField[\s\S]*?name="clientId"[\s\S]*?<\/FormField>/;

    if (clientIdPatternFull.test(content)) {
        content = content.replace(clientIdPatternFull, (match) => match + '\n' + equipmentField);
    } else if (clientIdPattern.test(content)) {
        content = content.replace(clientIdPattern, (match) => match + '\n' + equipmentField);
    } else {
        console.log("❌ Encontrei o arquivo, mas o padrão de código é diferente do esperado.");
        return;
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ Sucesso! Campo 'Equipamento' injetado em: ${targetFile}`);
}

findAndFix();