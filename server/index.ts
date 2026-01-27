import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import bcryptjs from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const app = express();

// Função para criar usuário admin padrão
async function ensureDefaultAdmin() {
  try {
    // Verificar se o usuário admin já existe
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.username, "admin"),
    });

    if (existingAdmin) {
      log("✅ Usuário admin padrão já existe");
      return;
    }

    // Criar hash da senha padrão
    const hashedPassword = await bcryptjs.hash("admin", 10);

    // Criar usuário admin padrão
    const newAdmin = await db.insert(users).values({
      username: "admin",
      name: "Administrador",
      password: hashedPassword,
    }).returning();

    log(`✅ Usuário admin padrão criado com sucesso (ID: ${newAdmin[0].id})`);
  } catch (error) {
    console.error("❌ Erro ao criar usuário admin padrão:", error);
  }
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CRÍTICO: Desabilitar cache HTTP para APIs - força recarregamento de dados
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Criar usuário admin padrão se não existir
  await ensureDefaultAdmin();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
