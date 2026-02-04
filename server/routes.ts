import { google } from "googleapis";
import type { Express } from "express";
import { createServer as createHttpServer } from "http"; 
import { createServer as createHttpsServer, type Server } from "https"; 
import { storage } from "./storage";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { 
  insertClientSchema, 
  insertServiceSchema, 
  insertCallSchema, 
  insertQuoteSchema, 
  insertFinancialTransactionSchema, 
  insertMessageSchema, 
  insertClientNoteSchema, 
  insertPreventiveMaintenanceSchema, 
  insertKnowledgeBaseSchema, 
  insertDownloadLinkSchema, 
  insertInventoryProductSchema, 
  insertInventoryServiceSchema, 
  insertInventoryMovementSchema, 
  clientNotes 
} from "@shared/schema";
import { desc, sql } from "drizzle-orm";
import { 
  sendTelegramNotification, 
  formatCallNotification, 
  formatCallToServiceNotification, 
  formatServiceToFinancialNotification, 
  formatFinancialPaidNotification, 
  formatFinancialToServiceNotification, 
  formatClientCreatedNotification, 
  formatClientUpdatedNotification, 
  formatServiceCreatedNotification, 
  formatServiceUpdatedNotification, 
  formatCallCreatedNotification, 
  formatCallUpdatedNotification, 
  formatFinancialCreatedNotification, 
  formatQuoteCreatedNotification, 
  formatQuoteUpdatedNotification, 
  formatCallDeletedNotification, 
  formatServiceDeletedNotification, 
  formatFinancialDeletedNotification, 
  formatClientDeletedNotification, 
  formatFinancialDiscountNotification, 
  formatFinancialInstallmentNotification, 
  formatFinancialPaymentNotification, 
  formatFinancialPDFNotification, 
  formatFinancialUpdateNotification, 
  formatQuoteGeneratedNotification, 
  formatUserCreatedNotification, 
  formatUserUpdatedNotification 
} from "./utils/telegram";
import { validateNotificationPayload, ensureCorrectUserId } from "./utils/notificationValidator";
import { generateHardwareFingerprint } from "./utils/hardware-fingerprint";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";

// ============================================================================
// CONSTANTE PROTEGIDA - SENHA MESTRE HARDCODED
// ============================================================================

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const MASTER_PASSWORD = "Apoiotec1@Informatica";

// Helper para obter userName pelo userId
async function getUserNameById(userId?: number | null): Promise<string> {
  if (!userId) return "Sistema";
  try {
    const user = await storage.getUser(userId);
    return user?.name || user?.username || "Sistema";
  } catch {
    return "Sistema";
  }
}

// Função para atualizar o status da transação pai quando parcelas são pagas
async function updateParentTransactionStatus(parentId: number) {
  try {
    console.log("Verificando status da transação pai:", parentId);
    
    // Buscar todas as parcelas desta transação pai
    const installments = await storage.getInstallmentsByParentId(parentId);
    console.log("Parcelas encontradas:", installments.length);
    
    // Contar quantas estão pagas
    const paidInstallments = installments.filter(inst => inst.status === "pago");
    console.log("Parcelas pagas:", paidInstallments.length);
    
    // Buscar transação pai
    const parentTransaction = await storage.getFinancialTransaction(parentId);
    if (!parentTransaction) {
      console.log("Transação pai não encontrada");
      return;
    }
    
    // Calcular valores pagos em vez de contar parcelas
    const totalPaid = paidInstallments.reduce((sum, inst) => 
      sum + parseFloat(inst.amount.toString()), 0
    );
    const totalAmount = parseFloat(parentTransaction.amount.toString());
    
    console.log(`Valores: Pago=${totalPaid}, Total=${totalAmount}`);
    
    // Determinar novo status baseado em VALORES
    let newStatus = "pendente";
    if (totalPaid >= totalAmount) {
      // Valor total foi pago
      newStatus = "pago";
      console.log("Valor total pago - marcando pai como pago");
    } else {
      // Qualquer valor menor que 100% - manter pendente
      newStatus = "pendente";
      console.log(`Ainda pendente: R$ ${totalPaid.toFixed(2)} de R$ ${totalAmount.toFixed(2)} recebidos`);
    }
    
    // Atualizar transação pai
    await storage.updateFinancialTransaction(parentId, {
      status: newStatus
    });
    
    console.log("Transação pai atualizada com status:", newStatus);
    
  } catch (error: any) {
    console.error("Erro ao atualizar transação pai:", error);
  }
}

// ============================================================================
// USUÁRIO PADRÃO - Funciona sem banco de dados para novas instalações
// ============================================================================
const DEFAULT_SETUP_USER = {
  id: 0,
  username: "setup",
  name: "Setup",
  password: "setup123" // Senha padrão - mude após primeiro acesso
};















async function createGoogleCalendarEvent(callData: any, creatorName: string) {
  try {
    const creds = process.env.GOOGLE_CREDENTIALS;
    if (!creds || creds.length < 10) return;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(creds),
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    const client = await storage.getClient(callData.clientId);
    const clientName = client ? client.name : "Cliente #" + callData.clientId;

    await calendar.events.insert({
      calendarId: '49a59e6761efdb568a7ad42266f2eb33e8dec5984becb520c917e4baa3a59c97@group.calendar.google.com',
      requestBody: {
        summary: `🛠️ ${clientName}`,
        description: `📝 PROBLEMA: ${callData.description || 'N/A'}\n\n🔒 OBSERVAÇÕES INTERNAS:\n${callData.internalNotes || 'Sem observações'}\n\n👤 TÉCNICO: ${creatorName}`,
        start: { dateTime: new Date(callData.callDate || new Date()).toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      },
    });
    console.log("✅ [CALENDAR] Sincronizado com Observações!");
  } catch (error: any) {
    console.log("❌ [CALENDAR] Erro:", error.message);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // ============================================================================
      // VERIFICAR USUÁRIO PADRÃO PRIMEIRO (não depende do banco)
      // ============================================================================
      if (username === DEFAULT_SETUP_USER.username && password === DEFAULT_SETUP_USER.password) {
        const { password: _, ...userWithoutPassword } = DEFAULT_SETUP_USER;
        
        console.log("✅ [LOGIN] Usuário setup logado com sucesso (usuário padrão)");
        
        return res.json(userWithoutPassword);
      }

      // ============================================================================
      // BUSCAR USUÁRIO NO BANCO DE DADOS
      // ============================================================================
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Para desenvolvimento, aceitar senha simples ou usar bcrypt se disponível
      let isValidPassword = false;
      if (user.password === password) {
        isValidPassword = true;
      } else {
        try {
          isValidPassword = await bcrypt.compare(password, user.password);
        } catch {
          isValidPassword = false;
        }
      }

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Não retornar a senha
      const { password: _, ...userWithoutPassword } = user;
      
      console.log("✅ [LOGIN] Usuário logado com sucesso:", {
        id: user.id,
        username: user.username,
        name: user.name
      });
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ message: "Name is required" });
      }
      
      const cleanData = {
        name: req.body.name,
        email: req.body.email || null,
        phone: req.body.phone || null,
        cpf: req.body.cpf || null,
        address: req.body.address || null,
        city: req.body.city || null,
        state: req.body.state || null,
        status: req.body.status || "ativo",
      };
      
      const client = await storage.createClient(cleanData);
      
      // Enviar notificação Telegram
      // CRÍTICO: Usar currentUserId como fallback para userId
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const userName = await getUserNameById(notificationUserId);
      try {
        await validateNotificationPayload({
          userId: notificationUserId,
          userName: userName,
          action: "client_created",
          resourceType: "client",
          resourceId: client.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      await sendTelegramNotification(formatClientCreatedNotification(client, userName), "client_created", notificationUserId,  undefined, notificationUserId);
      
      // Registrar no histórico
      const userId = notificationUserId;
      await storage.createHistoryEvent({
        callId: null,
        serviceId: null,
        transactionId: null,
        eventType: "client_created",
        description: `Cliente ${client.name} criado`,
        userId,
        metadata: JSON.stringify({ clientId: client.id, clientName: client.name })
      });
      
      res.status(201).json(client);
    } catch (error: any) {
      console.error("Client creation error:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Enviar notificação Telegram
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const userName = await getUserNameById(notificationUserId);
      try {
        await validateNotificationPayload({
          userId: notificationUserId,
          userName: userName,
          action: "client_updated",
          resourceType: "client",
          resourceId: client.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      await sendTelegramNotification(formatClientUpdatedNotification(client, userName), undefined, notificationUserId,  undefined, client.id || undefined);
      
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Buscar cliente antes de deletar para enviar notificação
      const clientToDelete = await storage.getClient(id);
      
      const success = await storage.deleteClient(id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Enviar notificação Telegram
      if (clientToDelete) {
        const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
        const userName = await getUserNameById(notificationUserId);
        try {
          await validateNotificationPayload({
            userId: notificationUserId,
            userName: userName,
            action: "client_deleted",
            resourceType: "client",
            resourceId: clientToDelete.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
        }
        await sendTelegramNotification(formatClientDeletedNotification(clientToDelete, userName), undefined, notificationUserId, userName);
        
        // Registrar no histórico
        await storage.createHistoryEvent({
          callId: null,
          serviceId: null,
          transactionId: null,
          eventType: "client_deleted",
          description: `Cliente ${clientToDelete.name} deletado`,
          userId: notificationUserId,
          metadata: JSON.stringify({ clientId: clientToDelete.id, clientName: clientToDelete.name })
        });
      }
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Delete client error:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Client Notes
  app.get("/api/clients/:clientId/notes", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      const notes = await storage.getClientNotes(clientId);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/clients/:clientId/notes", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      const validatedData = insertClientNoteSchema.parse({
        ...req.body,
        clientId,
      });
      const note = await storage.createClientNote(validatedData);
      
      // Enviar notificação
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const client = await storage.getClient(clientId);
      const userName = await getUserNameById(notificationUserId);
      try {
        await validateNotificationPayload({
          userId: notificationUserId,
          userName: userName,
          action: "client_note_created",
          resourceType: "client_note",
          resourceId: note.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      await sendTelegramNotification(`📝 Nota adicionada ao cliente ${client?.name || `#${clientId}`}\n━━━━━━━━━━━━━━━━\n📋 Nota: ${validatedData.content?.substring(0, 100) || "Sem conteúdo"}...\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`, "client_note_created", notificationUserId, userName);
      
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.put("/api/clients/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      const note = await storage.updateClientNote(id, { content });
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Enviar notificação
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const userName = await getUserNameById(notificationUserId);
      try {
        await validateNotificationPayload({
          userId: notificationUserId,
          userName: userName,
          action: "client_note_updated",
          resourceType: "client_note",
          resourceId: note.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      await sendTelegramNotification(`📝 Nota atualizada\n━━━━━━━━━━━━━━━━\n📋 Nota: ${content?.substring(0, 100) || "Sem conteúdo"}...\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`, "client_note_updated", notificationUserId, userName);
      
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.delete("/api/clients/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      const success = await storage.deleteClientNote(id);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Enviar notificação
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const userName = await getUserNameById(notificationUserId);
      try {
        await validateNotificationPayload({
          userId: notificationUserId,
          userName: userName,
          action: "client_note_deleted",
          resourceType: "client_note",
          resourceId: id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      await sendTelegramNotification(`🗑️ Nota deletada\n━━━━━━━━━━━━━━━━\n📝 Nota ID: ${id}\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`, "client_note_deleted", notificationUserId, userName);
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      console.log("=== SERVER: Recebendo criação de serviço ===");
      console.log("Body recebido:", req.body);
      
      // Usar diretamente os dados do frontend, preservando clientId, products E userId
      const serviceData = {
        name: req.body.name || "Novo Serviço",
        description: req.body.description || "",
        priority: req.body.priority || "media", // CRÍTICO: copiar prioridade do chamado
        callId: req.body.callId || null, // CRÍTICO: preservar ID do chamado original
        callDate: req.body.callDate ? (typeof req.body.callDate === 'string' ? new Date(req.body.callDate) : req.body.callDate) : null, // Data do chamado original
        serviceDate: req.body.serviceDate ? (typeof req.body.serviceDate === 'string' ? new Date(req.body.serviceDate) : req.body.serviceDate) : new Date(), // Data do serviço
        basePrice: req.body.basePrice || null,
        estimatedTime: req.body.estimatedTime || null,
        category: req.body.category || null,
        clientId: req.body.clientId || null, // CRÍTICO: preservar clientId
        products: req.body.products || null, // CRÍTICO: preservar discriminação de produtos
        userId: req.body.userId || 1, // PRESERVAR usuário criador
        createdByUserId: req.body.createdByUserId || req.body.userId || 1, // PRESERVAR usuário criador
        createdAt: req.body.createdAt || null, // PRESERVAR data de criação
      };
      
      console.log("Dados processados para criação:", serviceData);
      console.log("ClientId preservado:", serviceData.clientId);
      
      const service = await storage.createService(serviceData);
      
      console.log("Serviço criado com sucesso:", service);
      
      // Registrar evento de histórico com timestamp do serviço
      // NÃO duplicar evento se for conversão - a notificação será enviada logo abaixo
      if (!req.body.callId) {
        await storage.createHistoryEvent({
          serviceId: service.id,
          callId: null,
          eventType: 'service_created',
          description: `Serviço criado: ${service.name}`,
          userId: req.body?.userId || service.userId,
        });
      }
      
      // Enviar notificação Telegram se convertido de chamado
      if (req.body.callId) {
        // Registrar evento de conversão UMA ÚNICA VEZ
        await storage.createHistoryEvent({
          serviceId: service.id,
          callId: req.body.callId,
          eventType: 'converted_to_service',
          description: `Chamado convertido em serviço: ${service.name}`,
          userId: req.body?.userId || service.userId,
        });
        
        // Enviar notificação UMA ÚNICA VEZ - CORRIGIR: Se currentUserId for 1 (fallback), usar userId real
        let notificationUserIdForCall = req.body?.currentUserId || req.body?.userId || 1;
        if (notificationUserIdForCall === 1 && req.body?.userId && req.body?.userId !== 1) {
          notificationUserIdForCall = req.body.userId;
        }
        const callToServiceUserName = await getUserNameById(notificationUserIdForCall);
        try {
          await validateNotificationPayload({
            userId: notificationUserIdForCall,
            userName: callToServiceUserName,
            action: "call_to_service",
            resourceType: "service",
            resourceId: service.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
        }
        const call = await storage.getCall(req.body.callId);
        if (call && call.clientId) {
          const client = await storage.getClient(call.clientId);
          const notificationCall = { ...call, client };
          await sendTelegramNotification(formatCallToServiceNotification(notificationCall, service, callToServiceUserName), "call_to_service", notificationUserIdForCall, callToServiceUserName);
        } else if (call) {
          await sendTelegramNotification(formatCallToServiceNotification(call, service, callToServiceUserName), "call_to_service", notificationUserIdForCall, callToServiceUserName);
        }
      }
      
      // Enviar notificação Telegram se convertido de financeiro
      if (req.body.category === 'Convertido de Faturamento' && service.clientId) {
        let notificationUserIdForFinService = req.body?.currentUserId || req.body?.userId || 1;
        if (notificationUserIdForFinService === 1 && req.body?.userId && req.body?.userId !== 1) {
          notificationUserIdForFinService = req.body.userId;
        }
        const finServiceUserName = await getUserNameById(notificationUserIdForFinService);
        try {
          await validateNotificationPayload({
            userId: notificationUserIdForFinService,
            userName: finServiceUserName,
            action: "financial_to_service",
            resourceType: "service",
            resourceId: service.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
        }
        const client = await storage.getClient(service.clientId);
        if (client) {
          const mockTransaction = {
            id: service.id,
            amount: service.basePrice || '0,00',
            type: 'entrada',
            client: client
          };
          await sendTelegramNotification(formatFinancialToServiceNotification(mockTransaction, finServiceUserName), undefined, notificationUserIdForFinService, finServiceUserName);
        }
      }
      
      // Enviar notificação Telegram para novo serviço (se não foi conversão)
      if (!req.body.callId && req.body.category !== 'Convertido de Faturamento') {
        let notificationUserIdForNewService = req.body?.currentUserId || req.body?.userId || 1;
        if (notificationUserIdForNewService === 1 && req.body?.userId && req.body?.userId !== 1) {
          notificationUserIdForNewService = req.body.userId;
        }
        // Buscar serviço completo com cliente para notificação
        const newServiceUserName = await getUserNameById(notificationUserIdForNewService);
        try {
          await validateNotificationPayload({
            userId: notificationUserIdForNewService,
            userName: newServiceUserName,
            action: "service_created",
            resourceType: "service",
            resourceId: service.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
        }
        const serviceWithClient = await storage.getService(service.id);
        if (serviceWithClient && serviceWithClient.clientId) {
          const client = await storage.getClient(serviceWithClient.clientId);
          const notificationService = { ...serviceWithClient, client };
          await sendTelegramNotification(formatServiceCreatedNotification(notificationService, newServiceUserName), "service_created", notificationUserIdForNewService, newServiceUserName, (notificationUserIdForNewService || undefined));
        } else if (serviceWithClient) {
          await sendTelegramNotification(formatServiceCreatedNotification(serviceWithClient, newServiceUserName), "service_created", notificationUserIdForNewService, newServiceUserName, (notificationUserIdForNewService || undefined));
        }
      }
      
      res.status(201).json(service);
    } catch (error: any) {
      console.error("Service creation error:", error);
      const errorMessage = error instanceof Error ? (error as Error).message : "Unknown error";
      res.status(400).json({ 
        message: "Failed to create service",
        error: errorMessage 
      });
    }
  });

  app.patch("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // CRÍTICO: Usar currentUserId (usuário que está fazendo a atualização) para notificações
      // Preservar userId original para manter histórico do criador
      let notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      if (notificationUserId === 1 && req.body?.userId && req.body?.userId !== 1) {
        notificationUserId = req.body.userId;
      }
      const updateData = { ...req.body };
      
      // Remover currentUserId dos dados de atualização (não deve ser persistido)
      delete updateData.currentUserId;
      
      // CRÍTICO: Se createdByUserId não estiver no body, buscar do serviço existente
      if (!updateData.createdByUserId) {
        const existingService = await storage.getService(id);
        if (existingService && (existingService as any).createdByUserId) {
          updateData.createdByUserId = (existingService as any).createdByUserId;
        }
      }
      
      // Converter serviceDate para Date se fornecido
      if (updateData.serviceDate && typeof updateData.serviceDate === 'string') {
        updateData.serviceDate = new Date(updateData.serviceDate);
      } else if (updateData.serviceDate === "") {
        updateData.serviceDate = null;
      }
      
      const service = await storage.updateService(id, updateData);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Registrar atualização no histórico (apenas se NÃO for conversão recém-feita)
      if (!req.body.skipHistoryAndNotification) {
        // ✅ VALIDAÇÃO INTERNA: Garantir que notificationUserId está correto
        const validatedUserName = await getUserNameById(notificationUserId);
        try {
          await validateNotificationPayload({
            userId: notificationUserId,
            userName: validatedUserName,
            action: "service_updated",
            resourceType: "service",
            resourceId: service.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
          // Continua mesmo se falhar, mas log mostra o problema
        }

        await storage.createHistoryEvent({
          callId: service.callId || null,
          serviceId: service.id,
          transactionId: null,
          eventType: "service_updated",
          description: `Serviço #${service.id} atualizado`,
          userId: notificationUserId,
          metadata: JSON.stringify({ serviceId: service.id })
        });
        
        // Enviar notificação Telegram - buscar serviço com cliente para notificação
        const serviceWithClient = await storage.getService(id);
        if (serviceWithClient && serviceWithClient.clientId) {
          const client = await storage.getClient(serviceWithClient.clientId);
          const notificationService = { ...serviceWithClient, client };
          // FILTRO RIGOROSO: Passar fallbackUserId (criador do serviço) para corrigir automaticamente se o currentUserId for inválido
          await sendTelegramNotification(formatServiceUpdatedNotification(notificationService, validatedUserName), "service_updated", notificationUserId,  undefined, serviceWithClient.userId || undefined);
        } else if (serviceWithClient) {
          // FILTRO RIGOROSO: Passar fallbackUserId (criador do serviço) para corrigir automaticamente
          await sendTelegramNotification(formatServiceUpdatedNotification(serviceWithClient, validatedUserName), "service_updated", notificationUserId,  undefined, serviceWithClient.userId || undefined);
        }
      }
      
      res.json(service);
    } catch (error: any) {
      console.error("Service update error:", error);
      res.status(400).json({ message: "Invalid service data" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // CRÍTICO: Usar currentUserId como prioridade (usuário que está deletando)
      const userId = req.body?.currentUserId || req.body?.userId || 1;
      const skipNotification = req.body?.skipNotification === true; // Flag para pular notificação
      
      // Buscar dados do serviço ANTES de deletar para notificação
      const serviceToDelete = await storage.getService(id);
      
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Registrar deleção no histórico
      if (serviceToDelete) {
        const deleteUserName = await getUserNameById(userId);
        try {
          await validateNotificationPayload({
            userId: userId,
            userName: deleteUserName,
            action: "service_deleted",
            resourceType: "service",
            resourceId: serviceToDelete.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
        }

        await storage.createHistoryEvent({
          callId: serviceToDelete.callId || null,
          serviceId: serviceToDelete.id,
          transactionId: null,
          eventType: "service_deleted",
          description: `Serviço #${serviceToDelete.id} deletado`,
          userId: userId,
          metadata: JSON.stringify({ serviceId: serviceToDelete.id })
        });
        
        // Enviar notificação de exclusão APENAS se não for deleção automática do sistema
        if (!skipNotification) {
          if (serviceToDelete.clientId) {
            const client = await storage.getClient(serviceToDelete.clientId);
            const notificationService = { ...serviceToDelete, client };
            await sendTelegramNotification(formatServiceDeletedNotification(notificationService, deleteUserName), undefined, userId, deleteUserName);
          } else {
            await sendTelegramNotification(formatServiceDeletedNotification(serviceToDelete, deleteUserName), undefined, userId, deleteUserName);
          }
        }
      }
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Service deletion error:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Calls
  app.get("/api/calls", async (req, res) => {
    try {
      const calls = await storage.getCalls();
      res.json(calls);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch calls" });
    }
  });

  app.get("/api/calls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const call = await storage.getCall(id);
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      res.json(call);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch call" });
    }
  });

  app.post("/api/calls", async (req, res) => {
    try {
      console.log("=== CRIANDO CHAMADO NO SERVIDOR ===");
      console.log("Body recebido:", req.body);
      console.log("Data recebida:", req.body.callDate);
      
      // Se não informar callDate, usar data atual
      let callDate = req.body.callDate;
      if (callDate) {
        // Converter string ISO para Date se necessário
        callDate = typeof callDate === 'string' ? new Date(callDate) : callDate;
        console.log("Data processada:", callDate);
      } else {
        callDate = new Date();
        console.log("Usando data atual:", callDate);
      }
      
      const callData = {
        ...req.body,
        callDate: callDate,
        createdByUserId: req.body?.createdByUserId || req.body?.currentUserId || req.body?.userId || 1,
      };
      
      console.log("Dados finais para validação:", callData);
      const validatedData = insertCallSchema.parse(callData);
      console.log("Dados validados:", validatedData);
      
      const call = await storage.createCall(validatedData);
      console.log("Chamado criado:", call);
      
      // Registrar evento de histórico UMA ÚNICA VEZ
      // CRÍTICO: Usar currentUserId (quem criou) em vez de userId (atribuído)
      const userId = req.body?.currentUserId || req.body?.userId || 1;
      await storage.createHistoryEvent({
        callId: call.id,
        eventType: 'call_created',
        description: `Chamado criado: ${req.body.equipment}`,
        userId: userId,
      });
      
      // Enviar notificação Telegram
      const callUserName = await getUserNameById(userId);
      try {
        await validateNotificationPayload({
          userId: userId,
          userName: callUserName,
          action: "call_created",
          resourceType: "call",
          resourceId: call.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      
      const callWithClient = await storage.getCall(call.id);
      if (callWithClient && callWithClient.clientId) {
        const client = await storage.getClient(callWithClient.clientId);
        const notificationCall = { ...callWithClient, client };
        await sendTelegramNotification(formatCallCreatedNotification(notificationCall, callUserName), "call_created", userId, callUserName, userId);
      } else if (callWithClient) {
        await sendTelegramNotification(formatCallCreatedNotification(callWithClient, callUserName), "call_created", userId, callUserName, userId);
      }
      
      // Limpar cache para forçar nova busca
      res.set('Cache-Control', 'no-cache');
      
    // Automação Google Agenda
    createGoogleCalendarEvent(call, "Marcelo");
    res.status(201).json(call);
    } catch (error: any) {
      console.error("Call creation error:", error);
      res.status(400).json({ message: "Invalid call data", error: (error as Error).message });
    }
  });

  app.put("/api/calls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Processar callDate se enviada
      let callData = { ...req.body };
      if (callData.callDate) {
        callData.callDate = typeof callData.callDate === 'string' ? new Date(callData.callDate) : callData.callDate;
      }
      
      // PERMITIR EDITAR createdByUserId
      if (callData.createdByUserId !== undefined) {
        console.log("=== ATUALIZANDO createdByUserId em chamado ===", callData.createdByUserId);
      }
      
      const validatedData = insertCallSchema.partial().parse(callData);
      const call = await storage.updateCall(id, validatedData);
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      res.json(call);
    } catch (error: any) {
      console.error("Call update error:", error);
      res.status(400).json({ message: "Invalid call data" });
    }
  });

  app.patch("/api/calls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      console.log("=== EDITANDO CHAMADO NO SERVIDOR ===");
      console.log("ID do chamado:", id);
      console.log("Body recebido:", req.body);
      console.log("Data recebida:", req.body.callDate);
      
      // Processar callDate se enviada
      let updateData = { ...req.body };
      if (updateData.callDate) {
        updateData.callDate = typeof updateData.callDate === 'string' ? new Date(updateData.callDate) : updateData.callDate;
        console.log("Data processada:", updateData.callDate);
      }
      
      console.log("Dados finais para update:", updateData);
      
      // PERMITIR EDITAR createdByUserId
      if (updateData.createdByUserId !== undefined) {
        console.log("=== ATUALIZANDO createdByUserId em chamado (PATCH) ===", updateData.createdByUserId);
      }
      
      const call = await storage.updateCall(id, updateData);
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      
      console.log("Chamado atualizado:", call);
      
      // NÃO enviar notificação de atualização se for apenas alteração de status durante conversão
      if (!req.body.skipNotification) {
        // CRÍTICO: Usar SEMPRE currentUserId (quem está editando AGORA), nunca o userId do chamado
        const notificationUserIdForCallUpdate = req.body?.currentUserId || req.body?.userId || 1;

        // ✅ VALIDAÇÃO INTERNA: Garantir que notificationUserIdForCallUpdate está correto
        const validatedCallUserName = await getUserNameById(notificationUserIdForCallUpdate);
        try {
          await validateNotificationPayload({
            userId: notificationUserIdForCallUpdate,
            userName: validatedCallUserName,
            action: "call_updated",
            resourceType: "call",
            resourceId: call.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
        }

        // Registrar atualização no histórico
        await storage.createHistoryEvent({
          callId: call.id,
          serviceId: null,
          transactionId: null,
          eventType: "call_updated",
          description: `Chamado #${call.id} atualizado`,
          userId: notificationUserIdForCallUpdate,
          metadata: JSON.stringify({ callId: call.id })
        });
        
        // Enviar notificação Telegram - buscar chamado com cliente (UMA ÚNICA VEZ)
        let notificationCall;
        if (call.clientId) {
          const client = await storage.getClient(call.clientId);
          notificationCall = { ...call, client };
        } else {
          notificationCall = call;
        }
        await sendTelegramNotification(formatCallUpdatedNotification(notificationCall, validatedCallUserName), "call_updated", notificationUserIdForCallUpdate, validatedCallUserName);
      }
      
      res.json(call);
    } catch (error: any) {
      console.error("Call patch error:", error);
      res.status(400).json({ message: "Invalid call data", error: (error as Error).message });
    }
  });

  app.delete("/api/calls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // CRÍTICO: Usar currentUserId como prioridade (usuário que está deletando)
      const userId = req.body?.currentUserId || req.body?.userId || 1;
      
      // Buscar dados do chamado ANTES de deletar para notificação
      const callToDelete = await storage.getCall(id);
      
      const deleted = await storage.deleteCall(id);
      if (!deleted) {
        return res.status(404).json({ message: "Call not found" });
      }
      
      // Registrar deleção no histórico
      if (callToDelete) {
        const callDeleteUserName = await getUserNameById(userId);
        try {
          await validateNotificationPayload({
            userId: userId,
            userName: callDeleteUserName,
            action: "call_deleted",
            resourceType: "call",
            resourceId: callToDelete.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
        }

        await storage.createHistoryEvent({
          callId: callToDelete.id,
          serviceId: null,
          transactionId: null,
          eventType: "call_deleted",
          description: `Chamado #${callToDelete.id} deletado`,
          userId: userId,
          metadata: JSON.stringify({ callId: callToDelete.id })
        });
        
        // Enviar notificação de exclusão com usuário correto
        await sendTelegramNotification(formatCallDeletedNotification(callToDelete, callDeleteUserName), undefined, userId, callDeleteUserName);
      }
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Call deletion error:", error);
      res.status(500).json({ message: "Failed to delete call" });
    }
  });

  // Quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      // Criar um orçamento simplificado sem validação rígida
      const quoteData = {
        title: req.body.title || "Novo Orçamento",
        description: req.body.description || "",
        clientId: req.body.clientId || 1,
        callId: req.body.callId || null,
        items: req.body.items || JSON.stringify([{ description: req.body.description || "Serviço", amount: req.body.amount || "100.00" }]),
        subtotal: req.body.subtotal || req.body.amount || "100.00",
        total: req.body.total || req.body.amount || "100.00",
        status: req.body.status || "pendente",
        validUntil: null,
      };
      const quote = await storage.createQuote(quoteData);
      
      // Enviar notificação Telegram - buscar cliente
      let notificationUserIdForQuote = req.body?.currentUserId || req.body?.userId || 1;
      if (notificationUserIdForQuote === 1 && req.body?.userId && req.body?.userId !== 1) {
        notificationUserIdForQuote = req.body.userId;
      }
      const quoteUserName = await getUserNameById(notificationUserIdForQuote);
      try {
        await validateNotificationPayload({
          userId: notificationUserIdForQuote,
          userName: quoteUserName,
          action: "quote_created",
          resourceType: "quote",
          resourceId: quote.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      if (quote.clientId) {
        const client = await storage.getClient(quote.clientId);
        const notificationQuote = { ...quote, client };
        await sendTelegramNotification(formatQuoteCreatedNotification(notificationQuote, quoteUserName), "quote_created", notificationUserIdForQuote, quoteUserName);
      } else {
        await sendTelegramNotification(formatQuoteCreatedNotification(quote, quoteUserName), "quote_created", notificationUserIdForQuote, quoteUserName);
      }
      
      res.status(201).json(quote);
    } catch (error: any) {
      console.error("Quote creation error:", error);
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const quote = await storage.updateQuote(id, updateData);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Enviar notificação Telegram - buscar cliente
      let notificationUserIdForQuoteUpdate = req.body?.currentUserId || req.body?.userId || 1;
      if (notificationUserIdForQuoteUpdate === 1 && req.body?.userId && req.body?.userId !== 1) {
        notificationUserIdForQuoteUpdate = req.body.userId;
      }
      const quoteUpdateUserName = await getUserNameById(notificationUserIdForQuoteUpdate);
      try {
        await validateNotificationPayload({
          userId: notificationUserIdForQuoteUpdate,
          userName: quoteUpdateUserName,
          action: "quote_updated",
          resourceType: "quote",
          resourceId: quote.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      if (quote.clientId) {
        const client = await storage.getClient(quote.clientId);
        const notificationQuote = { ...quote, client };
        await sendTelegramNotification(formatQuoteUpdatedNotification(notificationQuote, quoteUpdateUserName), "quote_updated", notificationUserIdForQuoteUpdate, quoteUpdateUserName);
      } else {
        await sendTelegramNotification(formatQuoteUpdatedNotification(quote, quoteUpdateUserName), "quote_updated", notificationUserIdForQuoteUpdate, quoteUpdateUserName);
      }
      
      res.json(quote);
    } catch (error: any) {
      console.error("Quote update error:", error);
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error("Quote deletion error:", error);
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Financial Transactions
  app.get("/api/financial-transactions", async (req, res) => {
    try {
      const transactions = await storage.getFinancialTransactions();
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching financial transactions:", error);
      res.status(500).json({ message: "Failed to fetch financial transactions", error: (error as Error).message });
    }
  });

  app.post("/api/financial-transactions", async (req, res) => {
    try {
      console.log("=== SERVER: Criando transação financeira ===");
      console.log("Body recebido:", req.body);
      console.log("ClientId recebido:", req.body.clientId);

      // Buscar callId do serviço se não vier no body
      let callId = req.body.callId || null;
      if (!callId && req.body.serviceId) {
        const service = await storage.getService(req.body.serviceId);
        if (service && service.callId) {
          callId = service.callId;
        }
      }

      // Buscar createdByUserId do serviço se não vier no body
      let createdByUserId = req.body.createdByUserId || null;
      if (!createdByUserId && req.body.serviceId) {
        const service = await storage.getService(req.body.serviceId);
        if (service && service.createdByUserId) {
          createdByUserId = service.createdByUserId;
        }
      }

      // Preservar EXATAMENTE os dados recebidos do frontend
      const transactionData = {
        description: req.body.description || "Transação",
        resolution: req.body.resolution || null, // PRESERVAR RESOLUÇÃO
        clientId: req.body.clientId || null, // PRESERVAR CLIENTE!
        callId: callId, // Usar callId resolvido
        serviceId: req.body.serviceId || null, // PRESERVAR REFERÊNCIA AO SERVIÇO
        userId: req.body.userId || 1,
        createdByUserId: createdByUserId || req.body.userId || 1, // PRESERVAR CRIADOR ORIGINAL
        type: req.body.type || "entrada",
        amount: req.body.amount || "0.00",
        status: req.body.status || "pendente", // RESPEITAR STATUS ESCOLHIDO PELO USUÁRIO
        dueDate: req.body.dueDate || null,
        // CORRIGIR: Converter paidAt para Date se for string e status for "pago"
        paidAt: req.body.status === "pago" ? (
          req.body.paidAt ? (
            typeof req.body.paidAt === 'string' ? new Date(req.body.paidAt) : req.body.paidAt
          ) : new Date()
        ) : null,
        // PRESERVAR DETALHES DE PRODUTOS E SERVIÇOS
        serviceAmount: req.body.serviceAmount || null,
        productAmount: req.body.productAmount || null,
        serviceDetails: req.body.serviceDetails || null,
        productDetails: req.body.productDetails || null,
        // PRESERVAR DATA DO SERVIÇO ORIGINAL
        createdAt: req.body.serviceDate ? new Date(req.body.serviceDate) : new Date(),
        // Se status for "pago" e completedByUserId não está definido, usar userId
        completedByUserId: req.body.status === "pago" ? (req.body.completedByUserId || req.body.userId || 1) : null,
      };

      // Campos de conclusão são gerenciados automaticamente pelo sistema

      console.log("=== CRIANDO TRANSAÇÃO FINANCEIRA ===");
      console.log("Tipo:", transactionData.type);
      console.log("Status escolhido pelo usuário:", req.body.status);
      console.log("Status final:", transactionData.status);
      console.log("Dados processados:", transactionData);
      console.log("ClientId preservado:", transactionData.clientId);

      const transaction = await storage.createFinancialTransaction(transactionData);
      
      console.log("Transação criada:", transaction);
      
      // Registrar evento de histórico com timestamp apropriado
      const eventType = transaction.status === 'pago' ? 'payment_received' : 'converted_to_financial';
      const description = transaction.status === 'pago' 
        ? `Pagamento recebido: ${transaction.description}` 
        : `Serviço convertido para faturamento: ${transaction.description}`;
      
      await storage.createHistoryEvent({
        transactionId: transaction.id,
        serviceId: transaction.serviceId,
        callId: transaction.callId,
        eventType,
        description,
        userId: req.body?.userId || transaction.userId,
      });
      
      // Enviar APENAS UMA notificação Telegram - de conversão de serviço para financeiro
      // CRÍTICO: Usar currentUserId se disponível (usuário que está fazendo a conversão)
      let notificationUserIdForFinancial = req.body?.currentUserId || req.body?.userId || transaction.userId || 1;
      if (notificationUserIdForFinancial === 1 && req.body?.userId && req.body?.userId !== 1) {
        notificationUserIdForFinancial = req.body.userId;
      }
      const financialUserName = await getUserNameById(notificationUserIdForFinancial);
      try {
        await validateNotificationPayload({
          userId: notificationUserIdForFinancial,
          userName: financialUserName,
          action: "service_to_financial",
          resourceType: "transaction",
          resourceId: transaction.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      const transactionWithClient = await storage.getFinancialTransaction(transaction.id);
      if (transactionWithClient && transactionWithClient.clientId) {
        const client = await storage.getClient(transactionWithClient.clientId);
        const notificationTransaction = { ...transactionWithClient, client };
        await sendTelegramNotification(formatServiceToFinancialNotification({id: transaction.serviceId}, notificationTransaction, financialUserName), "service_to_financial", notificationUserIdForFinancial, financialUserName);
      } else if (transactionWithClient) {
        await sendTelegramNotification(formatServiceToFinancialNotification({id: transaction.serviceId}, transactionWithClient, financialUserName), "service_to_financial", notificationUserIdForFinancial, financialUserName);
      }
      
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Financial transaction creation error:", error);
      res.status(400).json({ message: "Invalid financial transaction data", error: (error as Error).message });
    }
  });

  app.put("/api/financial-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = { ...req.body };
      
      console.log("=== FINANCIAL UPDATE DEBUG ===");
      console.log("Original body:", req.body);
      console.log("UpdateData before conversion:", updateData);
      
      // Buscar transação original para verificar mudança de status
      const originalTransaction = await storage.getFinancialTransaction(id);
      if (!originalTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      console.log("Original status:", originalTransaction.status, "New status:", updateData.status);
      
      // CRÍTICO: Se mudou para "serviço" ou status diferente, zerar paidAt
      if (updateData.status === "serviço" || updateData.status === "pendente") {
        console.log("=== REVERTENDO TRANSAÇÃO - ZERANDO DADOS DE CONCLUSÃO ===");
        updateData.paidAt = null;
      }
      
      // Detectar reversão de financeiro para serviço
      const isRevertingToService = updateData.status === "serviço";
      if (isRevertingToService && originalTransaction.status !== "serviço") {
        console.log("=== TRANSAÇÃO REVERTIDA PARA SERVIÇO ===");
      }
      
      // Se mudou de "pago" para "pendente", zerar paidAt, completedAt e completedByUserId e NOTIFICAR
      if (originalTransaction.status === "pago" && updateData.status === "pendente") {
        console.log("=== MUDANÇA DE PAGO PARA PENDENTE - ZERANDO DADOS E NOTIFICANDO ===");
        updateData.paidAt = null;
        
        // Enviar notificação de reversão (pago → pendente)
        const reverseUserId = req.body?.currentUserId || req.body?.userId || 1;
        const reversedUserName = await getUserNameById(reverseUserId);
        try {
          await validateNotificationPayload({
            userId: reverseUserId,
            userName: reversedUserName,
            action: "financial_status_reversed",
            resourceType: "transaction",
            resourceId: originalTransaction.id,
          });
        } catch (validationError) {
          console.error("❌ Falha na validação de notificação:", validationError);
        }
        const notificationMessage = `↩️ **Status Revertido - Pago para Pendente**\n━━━━━━━━━━━━━━━━\n📋 Descrição: ${originalTransaction.description || "Sem descrição"}\n💳 Transação #${originalTransaction.id}\n💰 Valor: R$ ${originalTransaction.amount?.toString() || "0.00"}\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`;
        await sendTelegramNotification(notificationMessage, "financial_status_reversed", reverseUserId, reversedUserName);
      }
      
      // Converter strings de data para objetos Date
      if (updateData.paidAt && typeof updateData.paidAt === 'string') {
        updateData.paidAt = new Date(updateData.paidAt);
      }
      if (updateData.completedAt && typeof updateData.completedAt === 'string') {
        updateData.completedAt = new Date(updateData.completedAt);
      }
      if (updateData.dueDate && typeof updateData.dueDate === 'string') {
        updateData.dueDate = new Date(updateData.dueDate);
      }
      if (updateData.createdAt && typeof updateData.createdAt === 'string') {
        console.log("Converting createdAt from string:", updateData.createdAt);
        updateData.createdAt = new Date(updateData.createdAt);
        console.log("CreatedAt after conversion:", updateData.createdAt);
      }
      
      console.log("UpdateData after conversion:", updateData);
      
      console.log("Updating transaction:", id, "Original:", req.body, "Processed:", updateData);
      
      // Remove fields that don't exist in schema
      const { completedAt, ...safeUpdateData } = updateData;
      
      // Preservar completedByUserId quando marcando como pago, limpar ao reverter
      if (originalTransaction.status === "pago" && updateData.status === "pendente") {
        safeUpdateData.completedByUserId = null;
      } else if (updateData.completedByUserId !== undefined) {
        safeUpdateData.completedByUserId = updateData.completedByUserId;
      }
      
      // PERMITIR EDITAR createdByUserId
      if (updateData.createdByUserId !== undefined) {
        safeUpdateData.createdByUserId = updateData.createdByUserId;
        console.log("=== ATUALIZANDO createdByUserId ===", updateData.createdByUserId);
      }
      
      console.log("=== SAFE UPDATE DATA COM COMPLETED BY USER ID ===");
      console.log("SafeUpdateData:", safeUpdateData);
      console.log("CompletedByUserId será:", safeUpdateData.completedByUserId);
      console.log("CreatedByUserId será:", safeUpdateData.createdByUserId);
      
      const transaction = await storage.updateFinancialTransaction(id, safeUpdateData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      console.log("=== TRANSAÇÃO ATUALIZADA NO BANCO ===");
      console.log("Transação retornada:", {
        id: transaction.id,
        createdByUserId: transaction.createdByUserId,
        userId: transaction.userId,
        description: transaction.description
      });
      
      // Se esta transação é uma parcela sendo marcada como paga, atualizar a transação pai
      if (transaction.parentTransactionId && updateData.status === "pago") {
        console.log("=== ATUALIZANDO TRANSAÇÃO PAI ===");
        await updateParentTransactionStatus(transaction.parentTransactionId);
      }
      
      // Registrar evento de histórico se o status mudou para pago
      const notificationUserIdForTransaction = req.body?.currentUserId || req.body?.userId || 1;
      if (updateData.status === "pago") {
        console.log("=== CRIANDO EVENTO DE PAGAMENTO ===");
        console.log("Transaction ID:", transaction.id);
        console.log("Service ID:", transaction.serviceId);
        console.log("Call ID:", transaction.callId);
        console.log("Paid At:", transaction.paidAt);
        
        try {
          await storage.createHistoryEvent({
            transactionId: transaction.id,
            serviceId: transaction.serviceId,
            callId: transaction.callId,
            eventType: 'payment_received',
            description: `Pagamento recebido: ${transaction.description}`,
            userId: notificationUserIdForTransaction,
            
          });
          console.log("=== EVENTO DE PAGAMENTO CRIADO COM SUCESSO ===");
        } catch (eventError) {
          console.error("=== ERRO AO CRIAR EVENTO DE PAGAMENTO ===", eventError);
        }
      } else if (originalTransaction.status !== updateData.status) {
        // Registrar outras mudanças de status
        try {
          await storage.createHistoryEvent({
            transactionId: transaction.id,
            serviceId: transaction.serviceId,
            callId: transaction.callId,
            eventType: 'transaction_updated',
            description: `Transação #${transaction.id} atualizada - Status: ${originalTransaction.status} → ${updateData.status}`,
            userId: notificationUserIdForTransaction,
            metadata: JSON.stringify({ transactionId: transaction.id, oldStatus: originalTransaction.status, newStatus: updateData.status })
          });
        } catch (eventError) {
          console.error("=== ERRO AO CRIAR EVENTO DE ATUALIZAÇÃO ===", eventError);
        }
      }
      
      // Enviar notificação Telegram de pagamento se marcou como pago
      if (updateData.status === "pago" && originalTransaction.status !== "pago") {
        try {
          const paidUserName = await getUserNameById(notificationUserIdForTransaction);
          try {
            await validateNotificationPayload({
              userId: notificationUserIdForTransaction,
              userName: paidUserName,
              action: "payment_received",
              resourceType: "transaction",
              resourceId: transaction.id,
            });
          } catch (validationError) {
            console.error("❌ Falha na validação de notificação:", validationError);
          }
          const updatedTransaction = await storage.getFinancialTransaction(transaction.id);
          if (updatedTransaction && updatedTransaction.clientId) {
            const client = await storage.getClient(updatedTransaction.clientId);
            const notificationTransaction = { ...updatedTransaction, client };
            await sendTelegramNotification(formatFinancialPaidNotification(notificationTransaction, paidUserName), "payment_received", notificationUserIdForTransaction,  undefined, (notificationTransaction.userId || undefined));
          } else if (updatedTransaction) {
            await sendTelegramNotification(formatFinancialPaidNotification(updatedTransaction, paidUserName), "payment_received", notificationUserIdForTransaction,  undefined, (updatedTransaction.userId || undefined));
          }
        } catch (eventError) {
          console.error("=== ERRO AO NOTIFICAR PAGAMENTO ===", eventError);
        }
      }
      
      // Notificar se financeiro foi revertido para serviço
      if (isRevertingToService && originalTransaction.status !== "serviço") {
        try {
          const revertUserName = await getUserNameById(notificationUserIdForTransaction);
          try {
            await validateNotificationPayload({
              userId: notificationUserIdForTransaction,
              userName: revertUserName,
              action: "financial_to_service",
              resourceType: "transaction",
              resourceId: transaction.id,
            });
          } catch (validationError) {
            console.error("❌ Falha na validação de notificação:", validationError);
          }
          const updatedTransaction = await storage.getFinancialTransaction(transaction.id);
          if (updatedTransaction && updatedTransaction.clientId) {
            const client = await storage.getClient(updatedTransaction.clientId);
            const notificationTransaction = { ...updatedTransaction, client };
            await sendTelegramNotification(formatFinancialToServiceNotification(notificationTransaction, revertUserName), undefined, notificationUserIdForTransaction, revertUserName);
          } else if (updatedTransaction) {
            await sendTelegramNotification(formatFinancialToServiceNotification(updatedTransaction, revertUserName), undefined, notificationUserIdForTransaction, revertUserName);
          }
        } catch (eventError) {
          console.error("=== ERRO AO NOTIFICAR REVERSÃO ===", eventError);
        }
      }
      
      // Notificar edição geral de financeiro (quando mudou algum campo além de status para pago/pendente)
      if (!isRevertingToService && originalTransaction.status === updateData.status && Object.keys(updateData).some(key => key !== 'updatedAt')) {
        try {
          const editUserName = await getUserNameById(notificationUserIdForTransaction);
          try {
            await validateNotificationPayload({
              userId: notificationUserIdForTransaction,
              userName: editUserName,
              action: "financial_updated",
              resourceType: "transaction",
              resourceId: transaction.id,
            });
          } catch (validationError) {
            console.error("❌ Falha na validação de notificação:", validationError);
          }
          const updatedTransaction = await storage.getFinancialTransaction(transaction.id);
          if (updatedTransaction && updatedTransaction.clientId) {
            const client = await storage.getClient(updatedTransaction.clientId);
            const notificationTransaction = { ...updatedTransaction, client };
            await sendTelegramNotification(formatFinancialUpdateNotification(notificationTransaction, editUserName), "financial_updated", notificationUserIdForTransaction, editUserName);
          } else if (updatedTransaction) {
            await sendTelegramNotification(formatFinancialUpdateNotification(updatedTransaction, editUserName), "financial_updated", notificationUserIdForTransaction, editUserName);
          }
        } catch (eventError) {
          console.error("=== ERRO AO NOTIFICAR EDIÇÃO ===", eventError);
        }
      }
      
      console.log("Updated transaction:", transaction);
      res.json(transaction);
    } catch (error: any) {
      console.error("Transaction update error:", error);
      res.status(400).json({ message: "Invalid transaction data", error: (error as Error).message });
    }
  });

  app.delete("/api/financial-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // CRÍTICO: Usar currentUserId como prioridade (usuário que está deletando)
      const userId = req.body?.currentUserId || req.body?.userId || 1;
      
      // Buscar dados da transação ANTES de deletar para notificação
      const transactionToDelete = await storage.getFinancialTransaction(id);
      
      const deleted = await storage.deleteFinancialTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }
      
      // 🚫 Notificação de exclusão DESABILITADA - apenas a notificação de reversão é enviada
      // Se foi reversão para serviço, a notificação já foi enviada no PATCH anterior
      if (transactionToDelete) {
        await storage.createHistoryEvent({
          transactionId: transactionToDelete.id,
          serviceId: transactionToDelete.serviceId || null,
          callId: transactionToDelete.callId || null,
          eventType: "transaction_deleted",
          description: `Transação #${transactionToDelete.id} deletada - R$ ${transactionToDelete.amount}`,
          userId: userId,
          metadata: JSON.stringify({ transactionId: transactionToDelete.id, amount: transactionToDelete.amount })
        });
      }
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Transaction deletion error:", error);
      
      // Provide specific error messages for common issues
      let errorMessage = "Erro ao excluir a transação";
      if ((error as any).code === '23503') {
        errorMessage = "Esta transação possui parcelas ou referências associadas que impedem a exclusão";
      } else if ((error as Error).message) {
        errorMessage = (error as Error).message;
      }
      
      res.status(500).json({ message: errorMessage });
    }
  });

  // Add installment to existing transaction
  app.post("/api/financial-transactions/:id/installments", async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      const installmentData = req.body;
      
      console.log("=== CRIANDO PARCELA ===");
      console.log("Parent ID:", parentId);
      console.log("Installment data:", installmentData);
      
      // Get parent transaction to validate
      const parent = await storage.getFinancialTransaction(parentId);
      if (!parent) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      console.log("Parent transaction:", parent);

      // Create installment transaction
      const installmentToCreate = {
        description: `Parcela ${installmentData.installmentNumber} - ${parent.description}`,
        clientId: parent.clientId,
        callId: parent.callId,
        userId: installmentData.userId || parent.userId,
        type: parent.type,
        amount: installmentData.amount,
        status: "pendente", // SEMPRE pendente - o usuário marca como pago depois!
        parentTransactionId: parentId,
        installmentNumber: installmentData.installmentNumber,
        totalInstallments: installmentData.totalInstallments || null, // Só definir se vier do frontend
        dueDate: installmentData.dueDate ? new Date(installmentData.dueDate) : null, // CONVERTER STRING PARA DATE!
        paidAt: null, // Não definir paidAt - fica pendente!
        completedByUserId: null // Não preencher - só preenchemos quando o usuário marcar como pago
      };

      console.log("Creating installment with data:", installmentToCreate);

      const installment = await storage.createFinancialTransaction(installmentToCreate);
      
      console.log("Created installment:", installment);

      // IMPORTANTE: Não criar evento de pagamento ainda - a parcela está pendente!
      // O evento só será criado quando o usuário marcar a parcela como pago

      console.log("Parcela criada como pendente - aguardando marcação de pagamento");
      
      // Enviar notificação de parcela criada
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const userName = await getUserNameById(notificationUserId);
      try {
        await validateNotificationPayload({
          userId: notificationUserId,
          userName: userName,
          action: "installment_created",
          resourceType: "transaction",
          resourceId: installment.id,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      await sendTelegramNotification(`📦 Parcela Criada\n━━━━━━━━━━━━━━━━\n💳 Transação #${parentId}\n📋 Parcela ${installmentData.installmentNumber}/${installmentData.totalInstallments}\n💰 Valor: R$ ${installmentData.amount?.toString() || "0.00"}\n📅 Vencimento: ${new Date(installmentData.dueDate).toLocaleDateString("pt-BR")}\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`, "installment_created", notificationUserId, userName);

      res.json(installment);
    } catch (error: any) {
      console.error("Error creating installment:", error);
      res.status(500).json({ message: "Failed to create installment", error: (error as Error).message });
    }
  });

  // Apply discount to transaction
  app.post("/api/financial-transactions/:id/discount", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { discountAmount } = req.body;
      
      console.log("=== APLICANDO DESCONTO ===");
      console.log("Transaction ID:", transactionId);
      console.log("Discount amount:", discountAmount);
      
      // Get original transaction
      const originalTransaction = await storage.getFinancialTransaction(transactionId);
      if (!originalTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      console.log("Original transaction:", originalTransaction);

      const originalAmount = parseFloat(originalTransaction.amount.toString());
      const discount = parseFloat(discountAmount.toString());
      
      // Validations
      if (discount <= 0) {
        return res.status(400).json({ message: "Discount must be greater than 0" });
      }
      
      if (discount >= originalAmount) {
        return res.status(400).json({ message: "Discount cannot be greater than or equal to transaction amount" });
      }

      const newAmount = originalAmount - discount;
      
      console.log("Amounts:", { originalAmount, discount, newAmount });

      // Adicionar informação do desconto na resolução da transação
      let newResolution = originalTransaction?.resolution || "";
      
      // Adicionar informação do desconto na resolução
      const discountInfo = `\n\n--- DESCONTO APLICADO ---\nValor original: R$ ${originalAmount.toFixed(2).replace('.', ',')}\nDesconto: R$ ${discount.toFixed(2).replace('.', ',')}\nValor final: R$ ${newAmount.toFixed(2).replace('.', ',')}`;
      newResolution += discountInfo;

      // Update transaction with new amount and discount info
      const updatedTransaction = await storage.updateFinancialTransaction(transactionId, {
        amount: newAmount.toFixed(2),
        originalAmount: originalAmount.toFixed(2),
        discountAmount: discount.toFixed(2),
        resolution: newResolution
      });

      if (!updatedTransaction) {
        return res.status(500).json({ message: "Failed to update transaction" });
      }

      console.log("Updated transaction:", updatedTransaction);

      // 🔔 Enviar notificação de desconto aplicado
      const discountNotificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const discountUserName = await getUserNameById(discountNotificationUserId);
      try {
        await validateNotificationPayload({
          userId: discountNotificationUserId,
          userName: discountUserName,
          action: "discount_applied",
          resourceType: "transaction",
          resourceId: transactionId,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação de desconto:", validationError);
      }
      
      // Registrar no histórico
      await storage.createHistoryEvent({
        transactionId: transactionId,
        callId: originalTransaction.callId || null,
        serviceId: originalTransaction.serviceId || null,
        eventType: "discount_applied",
        description: `Desconto de R$ ${discount.toFixed(2).replace('.', ',')} aplicado à transação #${transactionId}`,
        userId: discountNotificationUserId,
        metadata: JSON.stringify({ transactionId, discount, originalAmount, newAmount })
      });

      await sendTelegramNotification(
        `💰 Desconto Aplicado\n━━━━━━━━━━━━━━━━\n📋 Transação #${transactionId}\n💳 Valor Original: R$ ${originalAmount.toFixed(2).replace('.', ',')}\n🎉 Desconto: R$ ${discount.toFixed(2).replace('.', ',')}\n💵 Novo Valor: R$ ${newAmount.toFixed(2).replace('.', ',')}\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`,
        "discount_applied",
        discountNotificationUserId,
        discountUserName
      );

      res.json({
        message: "Discount applied successfully",
        originalAmount,
        discountAmount: discount,
        newAmount,
        transaction: updatedTransaction
      });
    } catch (error: any) {
      console.error("Error applying discount:", error);
      res.status(500).json({ message: "Failed to apply discount", error: (error as Error).message });
    }
  });

  // Parcelamento
  app.post("/api/financial-transactions/:id/parcelamento", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { parcelas } = req.body;

      console.log("=== CRIANDO PARCELAMENTO ===");
      console.log("Transaction ID:", transactionId);
      console.log("Parcelas recebidas:", parcelas);

      // Buscar transação original
      const originalTransaction = await storage.getFinancialTransaction(transactionId);
      if (!originalTransaction) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }

      console.log("Transação original encontrada:", originalTransaction.id);

      // Validar se não tem parcelas existentes
      if (false) {
        return res.status(400).json({ message: "Esta transação já possui parcelas" });
      }

      // Validar se é uma entrada pendente
      if (originalTransaction.type !== "entrada" || originalTransaction.status !== "pendente") {
        return res.status(400).json({ message: "Só pode parcelar entradas pendentes" });
      }

      const valorOriginal = parseFloat(originalTransaction.amount.toString());
      const totalParcelas = parcelas.reduce((sum: number, p: any) => sum + p.valor, 0);

      // Validar se total das parcelas = valor original
      if (Math.abs(valorOriginal - totalParcelas) > 0.01) {
        return res.status(400).json({ 
          message: `Total das parcelas (${totalParcelas}) deve ser igual ao valor original (${valorOriginal})` 
        });
      }

      console.log("Validações passaram, criando parcelas...");

      // Criar as parcelas
      const parcelasCreated = [];
      for (let i = 0; i < parcelas.length; i++) {
        const parcela = parcelas[i];
        
        console.log(`=== CRIANDO PARCELA ${i + 1}/${parcelas.length} ===`);
        console.log("Dados da parcela recebida:", parcela);
        
        const parcelaData = {
          description: `Parcela ${i + 1}/${parcelas.length} - ${originalTransaction.description || "Pagamento"}`,
          clientId: originalTransaction.clientId,
          userId: originalTransaction.userId,
          type: "entrada" as const,
          amount: parcela.valor.toString(),
          status: "pendente" as const, // SEMPRE PENDENTE - NÃO PAGO
          parentTransactionId: transactionId,
          installmentNumber: i + 1,
          totalInstallments: parcelas.length,
          dueDate: new Date(parcela.data + 'T03:00:00.000Z'), // GMT-3 (horário de Brasília)
          createdAt: new Date(parcela.data + 'T03:00:00.000Z'), // Usar a data selecionada como data de criação no fuso correto
          serviceId: originalTransaction.serviceId,
          callId: originalTransaction.callId,
          serviceAmount: originalTransaction.serviceAmount,
          productAmount: originalTransaction.productAmount,
          serviceDetails: originalTransaction.serviceDetails,
          productDetails: originalTransaction.productDetails,
          // NÃO definir paidAt nem completedAt - deixar null para status pendente
          paidAt: null,
          completedAt: null,
          completedByUserId: null
        };

        console.log("Dados preparados para criação da parcela:", parcelaData);
        console.log("STATUS DEFINIDO COMO:", parcelaData.status);
        
        const createdParcela = await storage.createFinancialTransaction(parcelaData);
        console.log("Parcela criada no banco:", createdParcela);
        console.log("STATUS DA PARCELA CRIADA:", createdParcela.status);
        
        parcelasCreated.push(createdParcela);
      }

      // NÃO alterar o status - deixar "pendente" até receber 100%
      // O status será atualizado automaticamente via updateParentTransactionStatus quando parcelas forem pagas

      console.log("Parcelamento criado com sucesso!");
      
      // Enviar notificação de parcelamento criado
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const userName = await getUserNameById(notificationUserId);
      try {
        await validateNotificationPayload({
          userId: notificationUserId,
          userName: userName,
          action: "parcelamento_created",
          resourceType: "transaction",
          resourceId: transactionId,
        });
      } catch (validationError) {
        console.error("❌ Falha na validação de notificação:", validationError);
      }
      await sendTelegramNotification(`📊 Parcelamento Criado\n━━━━━━━━━━━━━━━━\n💳 Transação #${transactionId}\n📋 Total de parcelas: ${parcelas.length}\n💰 Valor total: R$ ${valorOriginal.toFixed(2).replace('.', ',')}\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`, "parcelamento_created", notificationUserId, userName);

      res.json({
        message: "Parcelamento criado com sucesso",
        originalTransaction: originalTransaction, // Não alterar nada na original
        parcelas: parcelasCreated
      });

    } catch (error: any) {
      console.error("Erro ao criar parcelamento:", error);
      res.status(500).json({ 
        message: "Erro interno do servidor", 
        error: (error as Error).message 
      });
    }
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.patch("/api/messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const message = await storage.updateMessage(id, updateData);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error: any) {
      console.error("Message update error:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMessage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error("Message deletion error:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Download Links
  app.get("/api/download-links", async (req, res) => {
    try {
      const links = await storage.getDownloadLinks();
      res.json(links);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch download links" });
    }
  });

  app.post("/api/download-links", async (req, res) => {
    try {
      const validatedData = insertDownloadLinkSchema.parse(req.body);
      const link = await storage.createDownloadLink(validatedData);
      res.status(201).json(link);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid link data" });
    }
  });

  app.patch("/api/download-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.updateDownloadLink(id, req.body);
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }
      res.json(link);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid link data" });
    }
  });

  app.delete("/api/download-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDownloadLink(id);
      if (!deleted) {
        return res.status(404).json({ message: "Link not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete link" });
    }
  });

  // Dashboard Stats
  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      
      // 🔔 Notificação: Novo usuário criado
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const userName = await getUserNameById(notificationUserId);
      
      await sendTelegramNotification(
        formatUserCreatedNotification(user, userName),
        "user_created",
        notificationUserId,
        undefined,
        notificationUserId
      );
      
      res.status(201).json(user);
    } catch (error: any) {
      console.error("User creation error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // 🔔 Notificação: Usuário atualizado
      const notificationUserId = req.body?.currentUserId || req.body?.userId || 1;
      const userName = await getUserNameById(notificationUserId);
      
      await sendTelegramNotification(
        formatUserUpdatedNotification(user, userName),
        "user_updated",
        notificationUserId,
        undefined,
        notificationUserId
      );
      
      res.json(user);
    } catch (error: any) {
      console.error("User update error:", error);
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error("User deletion error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post("/api/users/:id/reset-password", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.trim().length === 0) {
        return res.status(400).json({ message: "Nova senha é obrigatória" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Hash da senha com bcrypt
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const updatedUser = await storage.updateUser(id, { password: hashedPassword });
      if (!updatedUser) {
        return res.status(400).json({ message: "Falha ao resetar senha" });
      }

      res.json({ message: "Senha resetada com sucesso!" });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Erro ao resetar senha" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      
      if (settings) {
        res.json(settings);
      } else {
        // Retornar configurações padrão se não houver no banco
        const defaultSettings = {
          companyName: "Apoiotec Informática",
          cnpj: "15.292.813.0001-70",
          address: "Rua Maestro Vila Lobos, N° 381, Abolição 4, Mossoró-RN",
          phone: "84988288543 - 84988363828",
          email: "albano@hotmail.dk, marcelo@live.no",
          fontSize: "22",
          fontFamily: "system",
          theme: "light",
          primaryColor: "#2563eb",
          secondaryColor: "#00ff41",
        };
        res.json(defaultSettings);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      console.log("Salvando configurações:", req.body);
      const savedSettings = await storage.updateSystemSettings(req.body);
      res.json(savedSettings);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Templates routes
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      console.log("Templates fetched:", templates.length);
      res.json(templates);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post('/api/templates', async (req, res) => {
    try {
      console.log("Creating template with data:", req.body);
      const template = await storage.createTemplate(req.body);
      console.log("Template created:", template);
      res.status(201).json(template);
    } catch (error: any) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template", error: (error as Error).message });
    }
  });

  app.put('/api/templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Updating template", id, "with data:", req.body);
      const template = await storage.updateTemplate(id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      console.log("Template updated:", template);
      res.json(template);
    } catch (error: any) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template", error: (error as Error).message });
    }
  });

  app.delete('/api/templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Endpoint para zerar contadores de documentos
  app.post('/api/reset-counters', async (req, res) => {
    try {
      console.log("=== ZERANDO CONTADORES DE DOCUMENTOS ===");
      
      // Reset PostgreSQL sequences para reiniciar contadores de IDs
      await db.execute("SELECT setval(pg_get_serial_sequence('clients', 'id'), 1, false)");
      await db.execute("SELECT setval(pg_get_serial_sequence('services', 'id'), 1, false)");
      await db.execute("SELECT setval(pg_get_serial_sequence('calls', 'id'), 1, false)");
      await db.execute("SELECT setval(pg_get_serial_sequence('quotes', 'id'), 1, false)");
      await db.execute("SELECT setval(pg_get_serial_sequence('financial_transactions', 'id'), 1, false)");
      await db.execute("SELECT setval(pg_get_serial_sequence('messages', 'id'), 1, false)");
      
      console.log("Contadores zerados com sucesso");
      res.json({ 
        success: true, 
        message: "Contadores de documentos zerados com sucesso. Novos documentos começarão do número 1." 
      });
    } catch (error: any) {
      console.error("Erro ao zerar contadores:", error);
      res.status(500).json({ message: "Erro ao zerar contadores", error: (error as Error).message });
    }
  });

  // Endpoint para limpeza de dados órfãos/inválidos - REMOVIDO POR SEGURANÇA
  // Este endpoint foi desabilitado pois deletava dados válidos do usuário
  app.post('/api/cleanup-data', async (req, res) => {
    res.status(403).json({ 
      success: false,
      message: "Endpoint de limpeza desabilitado por segurança" 
    });
  });

  // Endpoint legado mantido para compatibilidade (não faz nada)
  app.post('/api/cleanup-data-old', async (req, res) => {
    try {
      console.log("=== LIMPEZA DE DADOS ÓRFÃOS (DESABILITADA) ===");
      
      // Deletar APENAS chamados órfãos (cliente foi deletado)
      const orphanCalls = await db.execute(`
        DELETE FROM calls 
        WHERE client_id NOT IN (SELECT id FROM clients);
      `);
      
      // Deletar serviços inválidos (sem nome ou preço)
      const invalidServices = await db.execute(`
        DELETE FROM services 
        WHERE name = '' 
        OR name IS NULL 
        OR base_price IS NULL 
        OR base_price <= 0;
      `);
      
      // Deletar transações órfãs (sem cliente válido)
      const orphanTransactions = await db.execute(`
        DELETE FROM financial_transactions 
        WHERE client_id IS NOT NULL 
        AND client_id NOT IN (SELECT id FROM clients);
      `);
      
      console.log("Limpeza concluída");
      res.json({ 
        success: true, 
        message: "Dados órfãos e inválidos removidos com sucesso.",
        details: {
          callsRemoved: orphanCalls.rowCount || 0,
          servicesRemoved: invalidServices.rowCount || 0,
          transactionsRemoved: orphanTransactions.rowCount || 0
        }
      });
    } catch (error: any) {
      console.error("Erro na limpeza:", error);
      res.status(500).json({ message: "Erro na limpeza de dados", error: (error as Error).message });
    }
  });

  // History Events Routes
  app.get("/api/history/call/:callId", async (req, res) => {
    try {
      const callId = parseInt(req.params.callId);
      const events = await storage.getHistoryEventsByCallId(callId);
      
      // Enriquecer eventos com nome do usuário
      const enrichedEvents = await Promise.all(
        events.map(async (event) => ({
          ...event,
          userName: event.userId ? await getUserNameById(event.userId) : "Sistema"
        }))
      );
      
      res.json(enrichedEvents);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar histórico do chamado", error: (error as Error).message });
    }
  });

  app.get("/api/history/service/:serviceId", async (req, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const events = await storage.getHistoryEventsByServiceId(serviceId);
      
      // Enriquecer eventos com nome do usuário
      const enrichedEvents = await Promise.all(
        events.map(async (event) => ({
          ...event,
          userName: event.userId ? await getUserNameById(event.userId) : "Sistema"
        }))
      );
      
      res.json(enrichedEvents);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar histórico do serviço", error: (error as Error).message });
    }
  });

  app.get("/api/history/transaction/:transactionId", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.transactionId);
      const events = await storage.getHistoryEventsByTransactionId(transactionId);
      
      // Enriquecer eventos com nome do usuário
      const enrichedEvents = await Promise.all(
        events.map(async (event) => ({
          ...event,
          userName: event.userId ? await getUserNameById(event.userId) : "Sistema"
        }))
      );
      
      res.json(enrichedEvents);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar histórico da transação", error: (error as Error).message });
    }
  });

  // Telegram Config Routes
  app.get("/api/telegram-config", async (req, res) => {
    try {
      let userId = req.query.userId ? parseInt(req.query.userId as string) : req.body?.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "userId não fornecido" });
      }
      const config = await storage.getTelegramConfig(userId);
      res.json(config || {});
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar configuração Telegram", error: (error as Error).message });
    }
  });

  app.post("/api/telegram-config", async (req, res) => {
    try {
      let userId = req.body.userId || req.body?.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "userId não fornecido" });
      }
      const { botToken, chatId, isActive } = req.body;
      if (!botToken || !chatId) {
        return res.status(400).json({ message: "botToken e chatId são obrigatórios" });
      }
      const config = await storage.updateTelegramConfig(userId, { userId, botToken, chatId, isActive });
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao salvar configuração Telegram", error: (error as Error).message });
    }
  });

  app.post("/api/telegram-test", async (req, res) => {
    try {
      let userId = req.body.userId || req.body?.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "userId não fornecido" });
      }
      const config = await storage.getTelegramConfig(userId);
      if (!config) {
        return res.status(400).json({ message: "Telegram não está configurado" });
      }
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: "✅ Teste de notificações Telegram - Sistema funcionando!",
        }),
      });
      if (response.ok) {
        res.json({ message: "Notificação de teste enviada com sucesso!" });
      } else {
        res.status(400).json({ message: "Erro ao enviar notificação", error: await response.text() });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao testar Telegram", error: (error as Error).message });
    }
  });

  // Notification Preferences Endpoints
  app.get("/api/notification-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const prefs = await storage.getNotificationPreferences(userId);
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar preferências", error: (error as Error).message });
    }
  });

  app.post("/api/notification-preferences", async (req, res) => {
    try {
      const { userId, notificationType, enabled } = req.body;
      if (!userId || !notificationType) {
        return res.status(400).json({ message: "userId e notificationType são obrigatórios" });
      }
      const pref = await storage.setNotificationPreference(userId, notificationType, enabled);
      res.json(pref);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao salvar preferência", error: (error as Error).message });
    }
  });

  // Custom Telegram Notification Endpoint
  app.post("/api/telegram-notification", async (req, res) => {
    try {
      const { message, type, action, service, client, currentUserId, userName } = req.body;
      
      // Handle specific actions
      if (action === "quote_generated" && service && client) {
        const userId = currentUserId || 1;
        const notificationUserName = userName || "Sistema";
        const serviceWithClient = { ...service, client };
        const sent = await sendTelegramNotification(
          formatQuoteGeneratedNotification(serviceWithClient, notificationUserName),
          "quote_generated",
          userId,
          notificationUserName
        );
        return res.json({ success: sent, message: sent ? "Notificação enviada" : "Nenhuma configuração Telegram encontrada" });
      }
      
      // Default: send custom message
      if (!message) {
        return res.status(400).json({ message: "Mensagem é obrigatória" });
      }
      const sent = await sendTelegramNotification(message, type);
      res.json({ success: sent, message: sent ? "Notificação enviada" : "Nenhuma configuração Telegram encontrada" });
    } catch (error: any) {
      console.error("Erro ao enviar notificação customizada:", error);
      res.status(500).json({ message: "Erro ao enviar notificação", error: (error as Error).message });
    }
  });

  // Knowledge Base Routes
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const articles = await storage.getKnowledgeBase();
      res.json(articles);
    } catch (error: any) {
      console.error("Erro ao buscar conhecimento:", error);
      res.status(500).json({ message: "Erro ao buscar base de conhecimento", error: (error as Error).message });
    }
  });

  app.post("/api/knowledge-base", async (req, res) => {
    try {
      const validated = insertKnowledgeBaseSchema.parse(req.body);
      const article = await storage.createKnowledgeArticle(validated);
      
      // Send Telegram notification
      const userId = req.body.userId || 1;
      const notificationEnabled = await storage.isNotificationEnabled(userId, "KNOWLEDGE_BASE_CREATED");
      if (notificationEnabled) {
        const config = await storage.getTelegramConfig(userId);
        if (config) {
          const userName = await getUserNameById(userId);
          const message = `📚 **Novo Artigo na Base de Conhecimento**\n\n` +
            `Título: ${req.body.title}\n` +
            `Categoria: ${req.body.category}\n` +
            `Problema: ${req.body.problem?.substring(0, 100)}...\n` +
            `Usuário: ${userName || "Sistema"}`;
          
          await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: config.chatId, text: message, parse_mode: "Markdown" }),
          });
        }
      }
      
      res.status(201).json(article);
    } catch (error: any) {
      console.error("Erro ao criar artigo:", error);
      res.status(500).json({ message: "Erro ao criar artigo", error: (error as Error).message });
    }
  });

  app.patch("/api/knowledge-base/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.updateKnowledgeArticle(id, req.body);
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao atualizar artigo" });
    }
  });

  app.delete("/api/knowledge-base/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteKnowledgeArticle(id);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao deletar artigo" });
    }
  });

  // Preventive Maintenance Routes
  app.get("/api/preventive-maintenance", async (req, res) => {
    try {
      const maintenances = await storage.getPreventiveMaintenances();
      res.json(maintenances);
    } catch (error: any) {
      console.error("Erro ao buscar manutenção preventiva:", error);
      res.status(500).json({ message: "Erro ao buscar manutenções", error: (error as Error).message });
    }
  });

  app.post("/api/preventive-maintenance", async (req, res) => {
    try {
      const data = {
        ...req.body,
        scheduledDate: new Date(req.body.scheduledDate),
      };
      const validated = insertPreventiveMaintenanceSchema.parse(data);
      const maintenance = await storage.createPreventiveMaintenance(validated);
      
      // Send Telegram notification
      const userId = req.body.userId || 1;
      const notificationEnabled = await storage.isNotificationEnabled(userId, "PREVENTIVE_MAINTENANCE_CREATED");
      if (notificationEnabled) {
        const config = await storage.getTelegramConfig(userId);
        if (config) {
          const client = req.body.clientId ? await storage.getClient(req.body.clientId) : null;
          const userName = await getUserNameById(userId);
          const message = `📅 **Manutenção Preventiva Agendada**\n\n` +
            `Título: ${req.body.title}\n` +
            `Cliente: ${client?.name || "N/A"}\n` +
            `Data: ${new Date(req.body.scheduledDate).toLocaleDateString('pt-BR')}\n` +
            `Frequência: ${req.body.frequency}\n` +
            `Usuário: ${userName || "Sistema"}`;
          
          await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: config.chatId, text: message, parse_mode: "Markdown" }),
          });
        }
      }
      
      res.status(201).json(maintenance);
    } catch (error: any) {
      console.error("Erro ao criar manutenção:", error);
      res.status(500).json({ message: "Erro ao criar manutenção", error: (error as Error).message });
    }
  });

  app.patch("/api/preventive-maintenance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body.scheduledDate ? {
        ...req.body,
        scheduledDate: new Date(req.body.scheduledDate),
      } : req.body;
      const maintenance = await storage.updatePreventiveMaintenance(id, data);
      res.json(maintenance);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao atualizar manutenção" });
    }
  });

  app.patch("/api/preventive-maintenance/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const maintenance = await storage.completePreventiveMaintenance(id);
      res.json(maintenance);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao completar manutenção" });
    }
  });

  app.delete("/api/preventive-maintenance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePreventiveMaintenance(id);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao deletar manutenção" });
    }
  });

  // Busca Universal - Search (COMPLETA)
  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string || "").toLowerCase();
      if (!query || query.length < 1) {
        return res.json({ clients: [], services: [], calls: [], transactions: [], notes: [] });
      }

      const [clients, services, calls, transactions, clientNotesData] = await Promise.all([
        storage.getClients(),
        storage.getServices(),
        storage.getCalls(),
        storage.getFinancialTransactions(),
        db.select().from(clientNotes).orderBy(desc(clientNotes.createdAt)).catch(() => [])
      ]);

      // Filtrar clientes
      const filteredClients = clients.filter((c: any) => 
        c.name.toLowerCase().includes(query) || 
        c.phone?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.cpf?.toLowerCase().includes(query)
      );

      // Filtrar serviços
      const filteredServices = services
        .filter((s: any) => {
          const clientName = clients.find((c: any) => c.id === s.clientId)?.name || "";
          return s.name.toLowerCase().includes(query) ||
            s.description?.toLowerCase().includes(query) ||
            s.category?.toLowerCase().includes(query) ||
            clientName.toLowerCase().includes(query);
        })
        .map((s: any) => ({
          ...s,
          clientName: clients.find((c: any) => c.id === s.clientId)?.name
        }));

      // Filtrar chamados
      const filteredCalls = calls
        .filter((c: any) => {
          const clientName = clients.find((cl: any) => cl.id === c.clientId)?.name || "";
          return c.description.toLowerCase().includes(query) ||
            c.equipment?.toLowerCase().includes(query) ||
            c.serviceType?.toLowerCase().includes(query) ||
            c.internalNotes?.toLowerCase().includes(query) ||
            clientName.toLowerCase().includes(query);
        })
        .map((c: any) => ({
          ...c,
          clientName: clients.find((cl: any) => cl.id === c.clientId)?.name
        }));

      // Filtrar transações (AGORA também por cliente!)
      const filteredTransactions = transactions
        .filter((t: any) => {
          const clientName = clients.find((c: any) => c.id === t.clientId)?.name || "";
          return t.description.toLowerCase().includes(query) ||
            t.resolution?.toLowerCase().includes(query) ||
            clientName.toLowerCase().includes(query);
        })
        .map((t: any) => ({
          ...t,
          clientName: clients.find((c: any) => c.id === t.clientId)?.name
        }));

      // Filtrar anotações de clientes
      const filteredNotes = (clientNotesData || [])
        .filter((n: any) =>
          n.content.toLowerCase().includes(query)
        )
        .map((n: any) => ({
          ...n,
          clientName: clients.find((c: any) => c.id === n.clientId)?.name
        }));

      res.json({
        clients: filteredClients,
        services: filteredServices,
        calls: filteredCalls,
        transactions: filteredTransactions,
        notes: filteredNotes
      });
    } catch (error: any) {
      console.error("Erro ao buscar:", error);
      res.status(500).json({ message: "Erro ao buscar" });
    }
  });

  // Get all items for a specific client
  app.get("/api/client-items/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const [clients, services, calls, transactions] = await Promise.all([
        storage.getClients(),
        storage.getServices(),
        storage.getCalls(),
        storage.getFinancialTransactions()
      ]);

      // Retornar apenas dados que realmente existem associados ao cliente
      const clientServices = services.filter((s: any) => s.clientId === clientId);
      const clientCalls = calls.filter((c: any) => c.clientId === clientId);
      const clientTransactions = transactions.filter((t: any) => t.clientId === clientId);

      res.json({
        services: clientServices,
        calls: clientCalls,
        transactions: clientTransactions
      });
    } catch (error: any) {
      console.error("Erro ao buscar items do cliente:", error);
      res.status(500).json({ message: "Erro ao buscar items" });
    }
  });

  // Diagnóstico de dados órfãos - SEM DELETAR NADA (apenas visualização)
  app.post("/api/cleanup-orphaned", async (req, res) => {
    try {
      const [clients, services, calls, transactions, quotes] = await Promise.all([
        storage.getClients(),
        storage.getServices(),
        storage.getCalls(),
        storage.getFinancialTransactions(),
        storage.getQuotes()
      ]);

      const clientIds = new Set(clients.map((c: any) => c.id));
      const callIds = new Set(calls.map((c: any) => c.id));
      const serviceIds = new Set(services.map((s: any) => s.id));

      const orphanedData = {
        orphanedServices: services.filter((s: any) => 
          (s.callId && !callIds.has(s.callId)) || 
          (s.clientId && !clientIds.has(s.clientId))
        ).length,
        orphanedTransactions: transactions.filter((t: any) =>
          (t.callId && !callIds.has(t.callId)) ||
          (t.serviceId && !serviceIds.has(t.serviceId)) ||
          (t.clientId && !clientIds.has(t.clientId))
        ).length,
        orphanedQuotes: quotes.filter((q: any) =>
          (q.callId && !callIds.has(q.callId)) ||
          (q.clientId && !clientIds.has(q.clientId))
        ).length
      };

      console.log("📊 DIAGNÓSTICO DE DADOS ÓRFÃOS (SEM DELETAR):", orphanedData);
      res.json({
        success: true,
        message: "Diagnóstico concluído - NENHUM dado foi deletado. Os dados órfãos foram apenas identificados.",
        orphanedCount: orphanedData,
        details: {
          info: "Esses dados órfãos não aparecem mais nas buscas, mas são mantidos no sistema para segurança dos dados."
        }
      });
    } catch (error: any) {
      console.error("Erro ao diagnosticar dados órfãos:", error);
      res.status(500).json({ message: "Erro ao diagnosticar", error: (error as Error).message });
    }
  });

 // ============================================================================
// SISTEMA DE ATIVAÇÃO - (TRAVA DE HARDWARE REMOVIDA)
// ============================================================================

// Esta rota agora sempre diz que o sistema está ativado
app.post("/api/activation/check", async (req, res) => {
  console.log("🔍 [ATIVAÇÃO] Check de hardware ignorado. Sistema liberado.");
  return res.json({ status: "activated", activated: true });
});

// Esta rota aprova qualquer tentativa de ativação automaticamente
app.post("/api/activation/activate", async (req, res) => {
  console.log("🔐 [ATIVAÇÃO] Ativação automática processada com sucesso.");
  return res.json({ 
    success: true, 
    activated: true, 
    message: "Sistema liberado pela Apoiotec!" 
  });
});

  app.post("/api/activation/activate", async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) return res.status(400).json({ message: "Senha é obrigatória" });

      const fingerprint = await generateHardwareFingerprint();
      const existing = await storage.getActivation();

      console.log("🔐 TENTATIVA DE ATIVAÇÃO");
      console.log("   Fingerprint do servidor:", fingerprint);

      // Verificar bloqueio por rate limiting
      if (existing) {
        if (existing.blockedUntil && existing.blockedUntil > new Date()) {
          const secondsLeft = Math.ceil((existing.blockedUntil.getTime() - Date.now()) / 1000);
          console.log("   🚫 Bloqueado!", secondsLeft, "segundos restantes");
          return res.status(429).json({ message: `Bloqueado. Tente novamente em ${secondsLeft}s`, secondsLeft });
        }
      }

      // Validar senha contra a constante MASTER_PASSWORD hardcoded
      if (password !== MASTER_PASSWORD) {
        console.log("   ❌ Senha incorreta!");
        await storage.recordFailedAttempt();
        const updated = await storage.getActivation();
        const attempts = updated?.failedAttempts || 0;
        const remaining = 10 - attempts;
        
        // Calcular se será bloqueado
        if (attempts === 5) {
          console.log("   ⚠️  5º erro - próximo será bloqueado por 30s!");
        }
        
        return res.status(401).json({ 
          message: "Senha incorreta", 
          attempts: attempts,
          remainingAttempts: remaining
        });
      }

      console.log("   ✅ Senha CORRETA!");

      // Senha correta!
      if (existing) {
        console.log("   📝 Sistema já ativado antes - Atualizando...");
        await storage.resetFailedAttempts();
        
        // Se fingerprint mudou, atualizar com o novo
        if (existing.hardwareFingerprint !== fingerprint) {
          console.log("   🔄 Hardware alterado! Fingerprint anterior:", existing.hardwareFingerprint);
          console.log("   🔄 Novo fingerprint:", fingerprint);
          await storage.updateActivation({ hardwareFingerprint: fingerprint });
          console.log("   ✅ Fingerprint atualizado com sucesso");
        } else {
          console.log("   ✅ Hardware = Mesmo servidor (fingerprint igual)");
        }
        
        return res.json({ success: true, activated: true, message: "Sistema reativado com sucesso" });
      } else {
        // Primeira ativação: criar registro com a nova senha (que é a constante)
        console.log("   🎉 PRIMEIRA ATIVAÇÃO - Salvando hardware fingerprint");
        await storage.createActivation({
          passwordHash: MASTER_PASSWORD,
          hardwareFingerprint: fingerprint
        });
        console.log("   ✅ Sistema ativado pela primeira vez com fingerprint:", fingerprint);
        res.json({ success: true, activated: true, message: "Sistema ativado com sucesso!" });
      }
    } catch (error: any) {
      console.error("Erro ao ativar sistema:", error);
      res.status(500).json({ message: "Erro ao ativar sistema" });
    }
  });

  // ============================================================================
  // SISTEMA DE BACKUPS
  // ============================================================================
  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/api/backup/generate", async (req, res) => {
    try {
      const { sendToTelegram } = req.body;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.sql`;
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupPath = path.join(backupDir, filename);

      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) throw new Error("DATABASE_URL não configurada");

      const urlObj = new URL(dbUrl!);
      const user = urlObj.username;
      const password = urlObj.password;
      const host = urlObj.hostname;
      const port = urlObj.port || "5432";
      const database = urlObj.pathname.slice(1);

      const env = { ...process.env, PGPASSWORD: password };
      // COMPLETO: --clean (limpa dados antigos), --if-exists, --no-owner, --no-acl
      execSync(`pg_dump --clean --if-exists --no-owner --no-acl -h ${host} -p ${port} -U ${user} -d ${database} > "${backupPath}"`, { env });

      const fileSize = fs.statSync(backupPath).size;
      console.log(`✅ Backup gerado: ${filename} (${fileSize} bytes)`);
      await storage.createBackupRecord({
        filename,
        fileSize,
        status: "sucesso"
      });

      const fileContent = fs.readFileSync(backupPath);
      
      // Enviar para Telegram se solicitado
      if (sendToTelegram) {
        try {
          const { formatBackupNotification, sendBackupFileToAllTelegram } = await import("./utils/telegram");
          const message = formatBackupNotification("sucesso", fileSize, new Date(), new Date());
          const sent = await sendBackupFileToAllTelegram(fileContent, filename, message);
          if (sent) {
            console.log("✅ Backup manual enviado para TODOS os usuários no Telegram");
          }
        } catch (e) {
          console.error("Erro ao enviar backup para Telegram:", e);
        }
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(fileContent);
    } catch (error: any) {
      console.error("Erro ao gerar backup:", error);
      res.status(500).json({ message: "Erro ao gerar backup" });
    }
  });

  app.get("/api/backup/history", async (req, res) => {
    try {
      const history = await storage.getBackupHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar histórico" });
    }
  });

  // ⚠️ ROTA ESPECÍFICA DEVE VIR ANTES DE ROTA GENÉRICA
  // Deletar arquivo de backup por filename
  app.delete("/api/backup/file/:filename", async (req, res) => {
    try {
      const filename = decodeURIComponent(req.params.filename);
      const backupPath = path.join(process.cwd(), 'backups', filename);
      
      if (!backupPath.startsWith(path.join(process.cwd(), 'backups'))) {
        return res.status(400).json({ message: "Caminho inválido" });
      }
      
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
        console.log(`🗑️ Arquivo deletado: ${filename}`);
        res.json({ message: "Arquivo deletado com sucesso", filename });
      } else {
        res.status(404).json({ message: "Arquivo não encontrado" });
      }
    } catch (error: any) {
      console.error("Erro ao deletar arquivo:", error);
      res.status(500).json({ message: "Erro ao deletar arquivo" });
    }
  });

  app.delete("/api/backup/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const history = await storage.getBackupHistory();
      const backup = history.find((b: any) => b.id === id);
      if (backup && backup.filename) {
        const backupPath = path.join(process.cwd(), 'backups', backup.filename);
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath);
          console.log(`🗑️ Arquivo deletado: ${backup.filename}`);
        }
      }
      const deleted = await storage.deleteBackupRecord(id);
      if (deleted) {
        res.json({ message: "Backup deletado com sucesso" });
      } else {
        res.status(404).json({ message: "Backup não encontrado" });
      }
    } catch (error: any) {
      console.error("Erro ao deletar backup:", error);
      res.status(500).json({ message: "Erro ao deletar backup" });
    }
  });

  app.delete("/api/backup", async (req, res) => {
    try {
      const history = await storage.getBackupHistory();
      const backupsDir = path.join(process.cwd(), 'backups');
      for (const backup of history) {
        if (backup.filename) {
          const backupPath = path.join(backupsDir, backup.filename);
          if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath);
          }
        }
        await storage.deleteBackupRecord(backup.id);
      }
      console.log(`🗑️ ${history.length} backup(s) deletado(s)`);
      res.json({ message: `${history.length} backup(s) deletado(s) com sucesso`, count: history.length });
    } catch (error: any) {
      console.error("Erro ao limpar backups:", error);
      res.status(500).json({ message: "Erro ao limpar backups" });
    }
  });

  app.post("/api/backup/restore", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Arquivo é obrigatório" });

      const currentActivation = await storage.getActivation();
      const backupPath = path.join('/tmp', `restore_${Date.now()}.sql`);
      fs.writeFileSync(backupPath, req.file.buffer);

      const dbUrl = process.env.DATABASE_URL;
      const urlObj = new URL(dbUrl!);
      const env = { 
        ...process.env, 
        PGPASSWORD: urlObj.password 
      };

      // Executa a restauração via psql
      
      execSync(`psql -h ${urlObj.hostname} -p ${urlObj.port || "5432"} -U ${urlObj.username} -d ${urlObj.pathname.slice(1)} < "${backupPath}"`, { env, stdio: 'pipe' });
      
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
    } catch (error: any) {
      console.error("Erro crítico no restore:", error);
      res.status(500).json({ message: "Erro ao restaurar backup" });
    }
  });

  // ============================================================================
  // ENDPOINTS DE BACKUP AGENDADO
  // ============================================================================
  
  // Criar agendamento
  app.post("/api/backup/schedules", async (req, res) => {
    try {
      const userId = 1;
      const { frequency, scheduledTime, sendToTelegram } = req.body;
      if (!frequency || !scheduledTime) {
        return res.status(400).json({ message: "Frequência e hora são obrigatórias" });
      }
      const schedule = await storage.createBackupSchedule({
        userId,
        frequency,
        scheduledTime,
        timezone: "-3",
        sendToTelegram: sendToTelegram ?? true,
        isActive: true,
        nextExecutionAt: new Date(),
      });
      res.json(schedule);
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);
      res.status(500).json({ message: "Erro ao criar agendamento" });
    }
  });

  // Listar agendamentos
  app.get("/api/backup/schedules", async (req, res) => {
    try {
      const userId = 1;
      const schedules = await storage.getBackupSchedules(userId);
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar agendamentos" });
    }
  });

  // Editar agendamento
  app.patch("/api/backup/schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.updateBackupSchedule(id, req.body);
      res.json(schedule);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao atualizar agendamento" });
    }
  });

  // Deletar agendamento
  app.delete("/api/backup/schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBackupSchedule(id);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao deletar agendamento" });
    }
  });

  // Ativar/desativar agendamento
  app.patch("/api/backup/schedules/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.getBackupSchedule(id);
      if (!schedule) return res.status(404).json({ message: "Agendamento não encontrado" });
      const updated = await storage.updateBackupSchedule(id, {
        isActive: !schedule.isActive
      });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao alternar agendamento" });
    }
  });

  // Listar logs de execução
  app.get("/api/backup/execution-logs", async (req, res) => {
    try {
      const logs = await storage.getBackupExecutionLogs();
      res.json(logs);
    } catch (error: any) {
      console.error("Erro ao buscar logs:", error);
      res.status(500).json({ message: "Erro ao buscar logs" });
    }
  });

  // Deletar log individual
  app.delete("/api/backup/execution-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBackupExecutionLog(id);
      if (deleted) {
        res.json({ message: "Log deletado com sucesso" });
      } else {
        res.status(404).json({ message: "Log não encontrado" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao deletar log" });
    }
  });

  // Limpar todos os logs - ROTA ESPECÍFICA DEVE VIR PRIMEIRO
  app.delete("/api/backup/execution-logs/all", async (req, res) => {
    try {
      console.log("🗑️ Iniciando limpeza de todos os logs de execução");
      const count = await storage.clearAllBackupExecutionLogs();
      console.log(`✅ ${count} log(s) deletado(s) com sucesso`);
      res.json({ message: `${count} log(s) deletado(s) com sucesso`, count });
    } catch (error: any) {
      console.error("Erro ao limpar logs:", error.message || error);
      res.status(500).json({ message: "Erro ao limpar logs: " + (error.message || "Erro desconhecido") });
    }
  });

  // Acessar pasta de backups
  app.get("/api/backup/folder-path", async (req, res) => {
    try {
      const backupPath = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }
      res.json({ path: backupPath });
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao obter caminho da pasta" });
    }
  });

  // Listar arquivos de backup
  app.get("/api/backup/files", async (req, res) => {
    try {
      const backupPath = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }
      const files = fs.readdirSync(backupPath);
      const backupFiles = files
        .filter(f => f.endsWith('.sql'))
        .map(f => {
          const fullPath = path.join(backupPath, f);
          const stats = fs.statSync(fullPath);
          return {
            name: f,
            size: stats.size,
            modified: stats.mtime,
            path: fullPath
          };
        })
        .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
      res.json({ files: backupFiles, count: backupFiles.length });
    } catch (error: any) {
      console.error("Erro ao listar arquivos:", error);
      res.status(500).json({ message: "Erro ao listar arquivos" });
    }
  });

  // Testar execução imediata
  app.post("/api/backup/test-execution/:id", async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const schedule = await storage.getBackupSchedule(scheduleId);
      if (!schedule) return res.status(404).json({ message: "Agendamento não encontrado" });
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_test_${timestamp}.sql`;
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        const backupPath = path.join(backupDir, filename);
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error("DATABASE_URL não configurada");
        const urlObj = new URL(dbUrl!);
        const user2 = urlObj.username;
        const password = urlObj.password;
        const host = urlObj.hostname;
        const port = urlObj.port || "5432";
        const database = urlObj.pathname.slice(1);
        const env = { ...process.env, PGPASSWORD: password };
        const cmd = `pg_dump -h ${host} -p ${port} -U ${user2} -d ${database} > "${backupPath}"`;
        execSync(cmd, { env, stdio: "pipe" });
        const fileSize = fs.statSync(backupPath).size;
        const fileBuffer = fs.readFileSync(backupPath);
        const executionLog = await storage.createBackupExecutionLog({
          scheduleId,
          status: "sucesso",
          scheduledTime: new Date(),
          executedAt: new Date(),
          fileSize,
          sentToTelegram: false,
        });
        if (schedule.sendToTelegram) {
          const { formatBackupNotification, sendBackupFileToAllTelegram } = await import("./utils/telegram");
          const message = formatBackupNotification("sucesso", fileSize, new Date(), new Date());
          const sent = await sendBackupFileToAllTelegram(fileBuffer, filename, message);
          if (sent) {
            await storage.updateBackupExecutionLog(executionLog.id, { sentToTelegram: true });
          }
        }
        res.json({ success: true, log: executionLog, fileSize });
      } catch (error: any) {
        console.error("Erro ao testar backup:", error);
        res.status(500).json({ message: `Erro ao testar: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
      }
    } catch (error: any) {
      console.error("Erro ao testar backup:", error);
      res.status(500).json({ message: `Erro ao testar: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    }
  });

  // ============================================================================
  // INVENTORY PRODUCTS
  // ============================================================================
  app.get("/api/inventory/products", async (req, res) => {
    try {
      const products = await storage.getInventoryProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching inventory products:", error);
      res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });

  app.post("/api/inventory/products", async (req, res) => {
    try {
      const validated = insertInventoryProductSchema.parse(req.body);
      const product = await storage.createInventoryProduct(validated);
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error creating inventory product:", error);
      res.status(400).json({ message: "Erro ao criar produto" });
    }
  });

  app.patch("/api/inventory/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertInventoryProductSchema.partial().parse(req.body);
      const product = await storage.updateInventoryProduct(id, validated);
      if (!product) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(product);
    } catch (error: any) {
      console.error("Error updating inventory product:", error);
      res.status(400).json({ message: "Erro ao atualizar produto" });
    }
  });

  app.delete("/api/inventory/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInventoryProduct(id);
      if (!success) return res.status(404).json({ message: "Produto não encontrado" });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting inventory product:", error);
      res.status(400).json({ message: "Erro ao deletar produto" });
    }
  });

  // ============================================================================
  // INVENTORY SERVICES
  // ============================================================================
  app.get("/api/inventory/services", async (req, res) => {
    try {
      const services = await storage.getInventoryServices();
      res.json(services);
    } catch (error: any) {
      console.error("Error fetching inventory services:", error);
      res.status(500).json({ message: "Erro ao buscar serviços" });
    }
  });

  app.post("/api/inventory/services", async (req, res) => {
    try {
      const validated = insertInventoryServiceSchema.parse(req.body);
      const service = await storage.createInventoryService(validated);
      res.status(201).json(service);
    } catch (error: any) {
      console.error("Error creating inventory service:", error);
      res.status(400).json({ message: "Erro ao criar serviço" });
    }
  });

  app.patch("/api/inventory/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertInventoryServiceSchema.partial().parse(req.body);
      const service = await storage.updateInventoryService(id, validated);
      if (!service) return res.status(404).json({ message: "Serviço não encontrado" });
      res.json(service);
    } catch (error: any) {
      console.error("Error updating inventory service:", error);
      res.status(400).json({ message: "Erro ao atualizar serviço" });
    }
  });

  app.delete("/api/inventory/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInventoryService(id);
      if (!success) return res.status(404).json({ message: "Serviço não encontrado" });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting inventory service:", error);
      res.status(400).json({ message: "Erro ao deletar serviço" });
    }
  });

  app.delete("/api/inventory/products-all", async (req, res) => {
    try {
      const products = await storage.getInventoryProducts();
      for (const product of products) {
        await storage.deleteInventoryProduct(product.id);
      }
      res.json({ success: true, deleted: products.length });
    } catch (error: any) {
      console.error("Error deleting all inventory products:", error);
      res.status(400).json({ message: "Erro ao deletar produtos" });
    }
  });

  app.delete("/api/inventory/movements-all", async (req, res) => {
    try {
      const db2 = await import("./db");
      const { inventoryMovements } = await import("@shared/schema");
      await (db2 as any).db.delete(inventoryMovements);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting all movements:", error);
      res.status(400).json({ message: "Erro ao deletar movimentações" });
    }
  });

  // ============================================================================
  // INVENTORY STATS & MOVEMENTS
  // ============================================================================
  app.get("/api/inventory/stats", async (req, res) => {
    try {
      const stats = await storage.getInventoryStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching inventory stats:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  app.get("/api/inventory/movements", async (req, res) => {
    try {
      const movements = await storage.getInventoryMovements();
      res.json(movements);
    } catch (error: any) {
      console.error("Error fetching inventory movements:", error);
      res.status(500).json({ message: "Erro ao buscar movimentações" });
    }
  });

  app.post("/api/inventory/movements", async (req, res) => {
    try {
      const validated = insertInventoryMovementSchema.parse(req.body);
      const movement = await storage.createInventoryMovement(validated);
      
      // ATUALIZAR QUANTIDADE DO PRODUTO
      const product = await storage.getInventoryProduct(validated.productId);
      if (product) {
        let newQuantity = parseInt(product.quantity.toString());
        
        if (validated.type === "saida") {
          newQuantity -= validated.quantity;
        } else if (validated.type === "entrada") {
          newQuantity += validated.quantity;
        }
        
        // Garantir que não fique negativo
        newQuantity = Math.max(0, newQuantity);
        
        await storage.updateInventoryProduct(validated.productId, { quantity: newQuantity as any });
      }
      
      res.status(201).json(movement);
    } catch (error: any) {
      console.error("Error creating inventory movement:", error);
      res.status(400).json({ message: "Erro ao registrar movimentação" });
    }
  });

  // ============================================================================
  // INVENTORY REPORT DATA (Frontend vai gerar o PDF)
  // ============================================================================
  app.post("/api/inventory/report-data", async (req, res) => {
    try {
      const { period = "all", startDate, endDate } = req.body;
      const products = await storage.getInventoryProducts();
      let movements = await storage.getInventoryMovements();
      const services = await storage.getInventoryServices();
      
      // Filter movements by period
      const now = new Date();
      let filteredMovements = movements;
      
      if (period === "thisMonth") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredMovements = movements.filter((m: any) => new Date(m.createdAt) >= monthStart);
      } else if (period === "lastMonth") {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        filteredMovements = movements.filter((m: any) => {
          const d = new Date(m.createdAt);
          return d >= lastMonthStart && d <= lastMonthEnd;
        });
      } else if (period === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredMovements = movements.filter((m: any) => {
          const d = new Date(m.createdAt);
          return d >= start && d <= end;
        });
      }
      
      res.json({ products, movements: filteredMovements, services });
    } catch (error: any) {
      console.error("Erro ao buscar dados do relatório:", error);
      res.status(500).json({ message: "Erro ao buscar dados do relatório" });
    }
  });

  // ============================================================================
  // BACKGROUND JOB - VERIFICAR AGENDAMENTOS A CADA MINUTO
  // ============================================================================
  setInterval(async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      const today = new Date().toDateString();
      
      const activeSchedules = await storage.getActiveBackupSchedules();
      console.log(`⏰ [SCHEDULER] ${now.toLocaleTimeString()} - Verificando ${activeSchedules.length} agendamento(s) ativo(s)`);
      
      for (const schedule of activeSchedules) {
        console.log(`📋 [SCHEDULER] Agendamento ID ${schedule.id}: horário=${schedule.scheduledTime}, frequência=${schedule.frequency}, ativo=${schedule.isActive}`);
        // Normalizar scheduledTime
        let scheduledTime = String(schedule.scheduledTime);
        if (typeof scheduledTime === 'object' && scheduledTime !== null && 'getHours' in scheduledTime) {
          const dateObj = scheduledTime as Date;
          scheduledTime = dateObj.getHours().toString().padStart(2, '0') + ':' + 
                         dateObj.getMinutes().toString().padStart(2, '0');
        }
        
        const shouldExecute = scheduledTime === currentTime;
        const lastExecution = schedule.lastExecutedAt ? new Date(schedule.lastExecutedAt) : null;
        const lastExecutionToday = lastExecution && new Date(lastExecution).toDateString() === today;
        
        // Verificar frequência
        let shouldRun = false;
        if (schedule.frequency === 'diario') {
          shouldRun = shouldExecute && !lastExecutionToday;
        } else if (schedule.frequency === 'semanal') {
          const lastDay = lastExecution ? new Date(lastExecution).getDay() : -1;
          const currentDay = now.getDay();
          shouldRun = shouldExecute && lastDay !== currentDay;
        } else if (schedule.frequency === 'mensal') {
          const lastDate = lastExecution ? new Date(lastExecution).getDate() : 0;
          const currentDate = now.getDate();
          shouldRun = shouldExecute && lastDate !== currentDate;
        }
        
        console.log(`  → Hora agendada: ${scheduledTime}, Hora atual: ${currentTime}, shouldExecute: ${shouldExecute}, shouldRun: ${shouldRun}`);
        
        if (shouldExecute && shouldRun) {
          console.log(`✅ 🕐 EXECUTANDO BACKUP ID ${schedule.id} (${schedule.frequency}) EM ${currentTime}`);
          try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup_scheduled_${timestamp}.sql`;
            const backupDir = path.join(process.cwd(), 'backups');
            if (!fs.existsSync(backupDir)) {
              fs.mkdirSync(backupDir, { recursive: true });
            }
            const backupPath = path.join(backupDir, filename);
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) throw new Error("DATABASE_URL não configurada");
            const urlObj = new URL(dbUrl!);
            const dbUser = urlObj.username;
            const dbPassword = urlObj.password;
            const dbHost = urlObj.hostname;
            const dbPort = urlObj.port || "5432";
            const dbName = urlObj.pathname.slice(1);
            const env = { ...process.env, PGPASSWORD: dbPassword };
            const cmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} > "${backupPath}"`;
            execSync(cmd, { env, stdio: "pipe" });
            const fileSize = fs.statSync(backupPath).size;
            const fileBuffer = fs.readFileSync(backupPath);
            const now = new Date();
            const status = "sucesso";
            const log = await storage.createBackupExecutionLog({
              scheduleId: schedule.id,
              status,
              scheduledTime: now,
              executedAt: now,
              fileSize,
              sentToTelegram: false,
            });
            if (schedule.sendToTelegram) {
              const { formatBackupNotification, sendBackupFileToAllTelegram } = await import("./utils/telegram");
              const message = formatBackupNotification(status, fileSize, now, now);
              const sent = await sendBackupFileToAllTelegram(fileBuffer, filename, message);
              if (sent) {
                await storage.updateBackupExecutionLog(log.id, { sentToTelegram: true });
              }
            }
            await storage.updateBackupSchedule(schedule.id, {
              lastExecutedAt: new Date()
            });
            await storage.createBackupRecord({
              filename,
              fileSize,
              status: "sucesso",
              notes: `Backup automático - ${schedule.frequency}`
            });
            console.log(`✅ Backup agendado #${schedule.id} concluído com sucesso`);
          } catch (error: any) {
            console.error(`❌ Erro ao executar backup agendado #${schedule.id}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            const errorTime = new Date();
            await storage.createBackupExecutionLog({
              scheduleId: schedule.id,
              status: "erro",
              scheduledTime: errorTime,
              executedAt: errorTime,
              errorMessage,
            });
            if (schedule.sendToTelegram) {
              const { formatBackupNotification } = await import("./utils/telegram");
              const message = formatBackupNotification("erro", undefined, errorTime, errorTime, errorMessage);
              try {
                const configs = await storage.getAllTelegramConfigs();
                for (const config of configs) {
                  if (config?.isActive && config?.chatId && config?.botToken) {
                    await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        chat_id: config.chatId,
                        text: message,
                        parse_mode: "HTML"
                      })
                    });
                  }
                }
              } catch (e) {
                console.error("Erro ao enviar notificação de erro:", e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Erro no background job de backups:", error);
    }
  }, 1 * 60 * 1000);

  // ============================================================================
  // CERTIFICADOS DIGITAIS E ASSINATURA
  // ============================================================================
  
  const certUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.originalname.endsWith('.pfx') || file.originalname.endsWith('.p12')) {
        cb(null, true);
      } else {
        cb(new Error('Arquivo deve ser .pfx ou .p12'));
      }
    }
  });

  app.get("/api/digital-certificates", async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT * FROM digital_certificates ORDER BY created_at DESC`);
      const certificates = result.rows.map((cert: any) => ({
        ...cert,
        expiryDate: cert.expiry_date,
        subjectName: cert.subject_name,
        issuerName: cert.issuer_name,
        serialNumber: cert.serial_number,
        certificatePath: cert.certificate_path,
        createdAt: cert.created_at,
        updatedAt: cert.updated_at
      }));
      
      for (const cert of certificates) {
        const expiryDate = new Date(cert.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let newStatus = 'active';
        if (daysUntilExpiry <= 0) {
          newStatus = 'expired';
        } else if (daysUntilExpiry <= 30) {
          newStatus = 'warning';
        }
        
        if (newStatus !== cert.status) {
          await db.execute(sql`UPDATE digital_certificates SET status = ${newStatus} WHERE id = ${cert.id}`);
          cert.status = newStatus;
        }
        
        cert.daysUntilExpiry = daysUntilExpiry;
      }
      
      res.json(certificates);
    } catch (error: any) {
      console.error("Erro ao buscar certificados:", error);
      res.status(500).json({ error: "Erro ao buscar certificados" });
    }
  });

  app.post("/api/digital-certificates/upload", certUpload.single('certificate'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      
      const { password, name } = req.body;
      if (!password) {
        return res.status(400).json({ error: "Senha do certificado é obrigatória" });
      }
      
      const { validateCertificatePassword, ensureCertificateDirectory, getCertificatePath } = await import('./utils/digital-signature');
      
      const tempPath = path.join('/tmp', `temp_${Date.now()}.pfx`);
      fs.writeFileSync(tempPath, req.file.buffer);
      
      const validation = validateCertificatePassword(tempPath, password);
      
      if (!validation.valid) {
        fs.unlinkSync(tempPath);
        return res.status(400).json({ error: validation.error });
      }
      
      if (!validation.info) {
        fs.unlinkSync(tempPath);
        return res.status(400).json({ error: "Não foi possível extrair informações do certificado" });
      }
      
      ensureCertificateDirectory();
      const filename = `cert_${Date.now()}.pfx`;
      const finalPath = getCertificatePath(filename);
      
      // Usar copyFile em vez de rename para suportar diferentes sistemas de arquivo (Replit)
      fs.copyFileSync(tempPath, finalPath);
      fs.unlinkSync(tempPath);
      
      const certName = name || validation.info.subjectName || 'Certificado Digital';
      
      const result = await db.execute(sql`
        INSERT INTO digital_certificates (name, subject_name, issuer_name, serial_number, cnpj, certificate_path, expiry_date, status)
        VALUES (${certName}, ${validation.info.subjectName}, ${validation.info.issuerName}, ${validation.info.serialNumber}, ${validation.info.cnpj}, ${finalPath}, ${validation.info.validTo}, ${validation.info.status})
        RETURNING *
      `);
      
      res.json({ 
        success: true, 
        certificate: result.rows[0],
        info: validation.info
      });
    } catch (error: any) {
      console.error("Erro ao fazer upload do certificado:", error);
      res.status(500).json({ error: "Erro ao processar certificado" });
    }
  });

  app.post("/api/digital-certificates/:id/test", async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: "Senha é obrigatória" });
      }
      
      const result = await db.execute(sql`SELECT * FROM digital_certificates WHERE id = ${id}`);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Certificado não encontrado" });
      }
      
      const cert = result.rows[0] as any;
      const { validateCertificatePassword } = await import('./utils/digital-signature');
      
      const validation = validateCertificatePassword(cert.certificate_path, password);
      
      if (!validation.valid) {
        return res.status(400).json({ valid: false, error: validation.error });
      }
      
      res.json({ valid: true, info: validation.info });
    } catch (error: any) {
      console.error("Erro ao testar certificado:", error);
      res.status(500).json({ error: "Erro ao testar certificado" });
    }
  });

  app.delete("/api/digital-certificates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.execute(sql`SELECT * FROM digital_certificates WHERE id = ${id}`);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Certificado não encontrado" });
      }
      
      const cert = result.rows[0] as any;
      
      if (fs.existsSync(cert.certificate_path)) {
        fs.unlinkSync(cert.certificate_path);
      }
      
      await db.execute(sql`DELETE FROM digital_certificates WHERE id = ${id}`);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erro ao deletar certificado:", error);
      res.status(500).json({ error: "Erro ao deletar certificado" });
    }
  });

  const signatureAttempts = new Map<number, { count: number; blockedUntil: Date | null }>();

  app.post("/api/digital-signature/sign", async (req, res) => {
    try {
      const { certificateId, password, pdfBase64, documentType, documentId, userId } = req.body;
      
      if (!certificateId || !password || !pdfBase64 || !documentType || !documentId) {
        return res.status(400).json({ error: "Parâmetros incompletos" });
      }
      
      const userIdNum = userId || 1;
      const attempts = signatureAttempts.get(userIdNum) || { count: 0, blockedUntil: null };
      
      if (attempts.blockedUntil && new Date() < attempts.blockedUntil) {
        const remainingSeconds = Math.ceil((attempts.blockedUntil.getTime() - Date.now()) / 1000);
        return res.status(429).json({ 
          error: `Aguarde ${remainingSeconds} segundos antes de tentar novamente`,
          blockedUntil: attempts.blockedUntil
        });
      }
      
      const certResult = await db.execute(sql`SELECT * FROM digital_certificates WHERE id = ${certificateId}`);
      if (certResult.rows.length === 0) {
        return res.status(404).json({ error: "Certificado não encontrado" });
      }
      
      const cert = certResult.rows[0] as any;
      
      if (cert.status === 'expired') {
        return res.status(400).json({ error: "Certificado expirado. Por favor, renove o certificado." });
      }
      
      const { validateCertificatePassword, signPdfWithCertificate } = await import('./utils/digital-signature');
      
      const validation = validateCertificatePassword(cert.certificate_path, password);
      
      if (!validation.valid) {
        attempts.count += 1;
        
        if (attempts.count >= 2) {
          attempts.blockedUntil = new Date(Date.now() + 3 * 60 * 1000);
          attempts.count = 0;
        }
        
        signatureAttempts.set(userIdNum, attempts);
        
        await db.execute(sql`
          INSERT INTO signature_audit_log (certificate_id, document_type, document_id, user_id, status, error_message)
          VALUES (${certificateId}, ${documentType}, ${documentId}, ${userIdNum}, 'failed', ${validation.error})
        `);
        
        return res.status(400).json({ 
          error: validation.error,
          attemptsRemaining: 2 - attempts.count
        });
      }
      
      signatureAttempts.set(userIdNum, { count: 0, blockedUntil: null });
      
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      
      console.log('🔐 [ASSINATURA ROUTE] Dados extraídos:');
      console.log('  - subjectName:', validation.info?.subjectName);
      console.log('  - CNPJ:', validation.info?.cnpj);
      
      const signatureResult = await signPdfWithCertificate(
        pdfBuffer,
        cert.certificate_path,
        password,
        {
          signerName: validation.info?.subjectName || cert.name,
          cnpj: validation.info?.cnpj || null,
          signedAt: new Date()
        }
      );
      
      if (!signatureResult.success) {
        await db.execute(sql`
          INSERT INTO signature_audit_log (certificate_id, document_type, document_id, user_id, status, error_message)
          VALUES (${certificateId}, ${documentType}, ${documentId}, ${userIdNum}, 'failed', ${signatureResult.error})
        `);
        
        return res.status(500).json({ error: signatureResult.error });
      }
      
      await db.execute(sql`
        INSERT INTO signature_audit_log (certificate_id, document_type, document_id, user_id, status)
        VALUES (${certificateId}, ${documentType}, ${documentId}, ${userIdNum}, 'success')
      `);
      
      res.json({
        success: true,
        signedPdfBase64: signatureResult.signedPdfBuffer?.toString('base64')
      });
    } catch (error: any) {
      console.error("Erro ao assinar documento:", error);
      res.status(500).json({ error: "Erro ao assinar documento" });
    }
  });

  app.get("/api/signature-audit-log", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT sal.*, dc.name as certificate_name
        FROM signature_audit_log sal
        LEFT JOIN digital_certificates dc ON sal.certificate_id = dc.id
        ORDER BY sal.created_at DESC
        LIMIT 100
      `);
      
      res.json(result.rows);
    } catch (error: any) {
      console.error("Erro ao buscar log de assinaturas:", error);
      res.status(500).json({ error: "Erro ao buscar log de assinaturas" });
    }
  });

  app.get("/api/digital-certificates/expiry-warning", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM digital_certificates 
        WHERE status IN ('warning', 'expired')
        ORDER BY expiry_date ASC
      `);
      
      res.json(result.rows);
    } catch (error: any) {
      console.error("Erro ao verificar certificados:", error);
      res.status(500).json({ error: "Erro ao verificar certificados" });
    }
  });

 // ============================================================================
  // INICIALIZAÇÃO DO SERVIDOR (HÍBRIDO: CLOUD/LOCAL)
  // ============================================================================
  
  let server: any;

  // Se estivermos em produção (Fly.io), ignoramos certificados e usamos HTTP
  if (process.env.NODE_ENV === "production") {
    server = createHttpServer(app);
    console.log("🌐 [SERVER] Fly.io Detectado: Iniciando em modo HTTP (SSL via Proxy)");
  } else {
    try {
      const keyPath = "/opt/apoiotec/certs/server.key";
      const certPath = "/opt/apoiotec/certs/server.crt";

      // Verifica se os arquivos existem no seu Arch Linux
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        server = createHttpsServer({
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        }, app);
        console.log("🔐 [SERVER] Arch Linux Detectado: Iniciando em modo HTTPS Local");
      } else {
        server = createHttpServer(app);
        console.log("⚠️ [SERVER] Certificados não encontrados em /opt/apoiotec/certs/. Usando HTTP.");
      }
    } catch (error: any) {
      server = createHttpServer(app);
      console.log("⚠️ [SERVER] Erro ao carregar certificados locais. Usando HTTP.");
    }
  }

  // Opcional: Redirecionamento de porta 8080 (apenas para ambiente local se necessário)
  if (process.env.NODE_ENV !== "production") {
    createHttpServer((req, res) => {
      const host = req.headers.host?.split(':')[0];
      res.writeHead(301, { "Location": `https://${host}:5000${req.url}` });
      res.end();
    }).listen(8080, "0.0.0.0");
  }

  return server;
}