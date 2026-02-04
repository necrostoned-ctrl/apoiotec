const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function repairRoutes() {
    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("Arquivo server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // Localiza o bloco da rota de restore até o início da próxima seção de agendamentos
    // para garantir que qualquer código duplicado seja removido.
    const startMarker = 'app.post("/api/backup/restore"';
    const endMarker = '// ENDPOINTS DE BACKUP AGENDADO';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        console.error("Não foi possível localizar os pontos de ancoragem no arquivo.");
        return;
    }

    const prefix = content.substring(0, startIndex);
    const suffix = content.substring(endIndex);

    // Bloco limpo e funcional com delay de estabilização
    const cleanRestoreBlock = `app.post("/api/backup/restore", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Arquivo é obrigatório" });

      const currentActivation = await storage.getActivation();
      const backupPath = path.join('/tmp', \`restore_\${Date.now()}.sql\`);
      fs.writeFileSync(backupPath, req.file.buffer);

      const dbUrl = process.env.DATABASE_URL;
      const urlObj = new URL(dbUrl);
      const env = { 
        ...process.env, 
        PGPASSWORD: urlObj.password 
      };

      // Executa a restauração via psql
      const { execSync } = require('child_process');
      execSync(\`psql -h \${urlObj.hostname} -p \${urlObj.port || "5432"} -U \${urlObj.username} -d \${urlObj.pathname.slice(1)} < \${backupPath}\`, { env, stdio: 'pipe' });
      
      // ⏳ Tempo de estabilização para o pool de conexões
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (currentActivation) {
        try {
          await storage.deleteActivation();
          await storage.createActivation({
            passwordHash: currentActivation.passwordHash,
            hardwareFingerprint: currentActivation.hardwareFingerprint,
            failedAttempts: currentActivation.failedAttempts || 0,
            blockedUntil: currentActivation.blockedUntil || null
          });
        } catch (e) {
          console.warn("Aviso: Ativação não restaurada automaticamente.");
        }
      }

      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
      res.json({ success: true, message: "Backup restaurado com sucesso!" });
    } catch (error) {
      console.error("Erro crítico no restore:", error);
      res.status(500).json({ message: "Erro ao restaurar backup" });
    }
  });

  // ============================================================================
  `;

    fs.writeFileSync(ROUTES_PATH, prefix + cleanRestoreBlock + suffix);
    console.log("✅ server/routes.ts corrigido com sucesso.");
}

repairRoutes();