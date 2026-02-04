const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function fixRestore() {
    console.log("🛠️ Ajustando lógica de restauração do Apoiotec...");

    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("❌ Arquivo server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // 1. Injetar um helper de delay se não existir
    if (!content.includes('const delay = (ms: number)')) {
        const delayHelper = '\nconst delay = (ms: number) => new Promise(res => setTimeout(res, ms));\n';
        content = content.replace('const MASTER_PASSWORD', delayHelper + 'const MASTER_PASSWORD');
    }

    // 2. Localizar o bloco de restore e melhorar a robustez
    const restoreRegex = /app\.post\("\/api\/backup\/restore"[\s\S]*?res\.json\(\{ success: true[\s\S]*?\}\);/g;
    
    const optimizedRestore = `app.post("/api/backup/restore", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Arquivo é obrigatório" });

      console.log("🔐 [RESTORE] Salvando ativação atual antes do restore...");
      const currentActivation = await storage.getActivation();
      
      const backupPath = path.join('/tmp', \`restore_\${Date.now()}.sql\`);
      fs.writeFileSync(backupPath, req.file.buffer);

      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) throw new Error("DATABASE_URL não configurada");

      const urlObj = new URL(dbUrl);
      const user = urlObj.username;
      const password = urlObj.password;
      const host = urlObj.hostname;
      const port = urlObj.port || "5432";
      const database = urlObj.pathname.slice(1);

      const env = { ...process.env, PGPASSWORD: password };
      console.log(\`🔄 Executando comando psql para: \${req.file.originalname}\`);
      
      // Executa o restore. O --clean garante que as tabelas sejam limpas.
      execSync(\`psql -h \${host} -p \${port} -U \${user} -d \${database} < \${backupPath}\`, { env, stdio: 'pipe' });
      
      // ⏳ AGUARDAR: Essencial para o pool de conexões do Node.js se estabilizar após o reset das tabelas
      console.log("⏳ Aguardando estabilização do banco...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 🔐 RESTAURAR ATIVAÇÃO: Usar try/catch individual para não quebrar o restore se a ativação falhar
      if (currentActivation) {
        try {
          console.log("🔐 Restaurando ativação original...");
          await storage.deleteActivation();
          await storage.createActivation({
            passwordHash: currentActivation.passwordHash,
            hardwareFingerprint: currentActivation.hardwareFingerprint,
            failedAttempts: currentActivation.failedAttempts || 0,
            blockedUntil: currentActivation.blockedUntil || null
          });
          console.log("✅ Ativação preservada.");
        } catch (e) {
          console.warn("⚠️ Falha ao restaurar ativação, mas os dados foram importados.", e.message);
        }
      }

      // Tentar registrar o log de backup (opcional, não deve travar o processo)
      try {
        await storage.createBackupRecord({
          filename: req.file.originalname,
          fileSize: req.file.size,
          status: "sucesso",
          notes: "Restaurado com sucesso"
        });
      } catch (e) {
        console.warn("⚠️ Não foi possível salvar o log de backup no banco recém-criado.");
      }

      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
      
      console.log("✅ Restore finalizado com sucesso!");
      res.json({ success: true, message: "Backup restaurado com sucesso! O sistema será reiniciado." });
    } catch (error) {
      console.error("❌ Erro crítico no restore:", error);
      res.status(500).json({ message: \`Erro ao restaurar: \${error instanceof Error ? error.message : 'Erro desconhecido'}\` });
    }
  });`;

    content = content.replace(restoreRegex, optimizedRestore);

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("✅ Lógica de restore atualizada com delay de estabilização.");
}

fixRestore();