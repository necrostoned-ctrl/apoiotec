import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { insertClientSchema, insertServiceSchema, insertCallSchema, insertQuoteSchema, insertFinancialTransactionSchema, insertMessageSchema, insertClientNoteSchema, insertPreventiveMaintenanceSchema, insertKnowledgeBaseSchema, insertDownloadLinkSchema, insertInventoryProductSchema, insertInventoryServiceSchema, insertInventoryMovementSchema, clientNotes } from "@shared/schema";
import { desc, sql } from "drizzle-orm";
import { sendTelegramNotification, formatCallNotification, formatCallToServiceNotification, formatServiceToFinancialNotification, formatFinancialPaidNotification, formatFinancialToServiceNotification, formatClientCreatedNotification, formatClientUpdatedNotification, formatServiceCreatedNotification, formatServiceUpdatedNotification, formatCallCreatedNotification, formatCallUpdatedNotification, formatFinancialCreatedNotification, formatQuoteCreatedNotification, formatQuoteUpdatedNotification, formatCallDeletedNotification, formatServiceDeletedNotification, formatFinancialDeletedNotification, formatClientDeletedNotification, formatFinancialDiscountNotification, formatFinancialInstallmentNotification, formatFinancialPaymentNotification, formatFinancialPDFNotification, formatFinancialUpdateNotification, formatQuoteGeneratedNotification, formatUserCreatedNotification, formatUserUpdatedNotification } from "./utils/telegram";
import { validateNotificationPayload, ensureCorrectUserId } from "./utils/notificationValidator";
import { generateHardwareFingerprint } from "./utils/hardware-fingerprint";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";

// ============================================================================
// CONSTANTE PROTEGIDA - SENHA MESTRE HARDCODED
// ============================================================================
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
    
  } catch (error) {
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
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      console.log("=== SERVER: Recebendo criação de serviço ===");
      console.log("Body recebido:", req.body);

      // CORREÇÃO DEFINITIVA: helper que SEMPRE retorna Date — nunca string, nunca null
      function toDateOrNow(value: any): Date {
        if (value instanceof Date && !isNaN(value.getTime())) return value;
        if (value) {
          const d = new Date(value);
          if (!isNaN(d.getTime())) return d;
        }
        return new Date();
      }

      function toDateOrNull(value: any): Date | null {
        if (!value) return null;
        if (value instanceof Date && !isNaN(value.getTime())) return value;
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
      }
      
      const serviceData = {
        name: req.body.name || "Novo Serviço",
        description: req.body.description || "",
        priority: req.body.priority || "media",
        callId: req.body.callId || null,
        callDate: toDateOrNull(req.body.callDate),
        serviceDate: toDateOrNow(req.body.serviceDate),
        basePrice: req.body.basePrice || null,
        estimatedTime: req.body.estimatedTime || null,
        category: req.body.category || null,
        clientId: req.body.clientId || null,
        products: req.body.products || null,
        userId: req.body.userId || 1,
        createdByUserId: req.body.createdByUserId || req.body.userId || 1,
        // CRÍTICO: sempre Date válido, nunca string
        createdAt: toDateOrNow(req.body.createdAt),
      };
      
      console.log("Dados processados para criação:", serviceData);
      console.log("createdAt tipo:", typeof serviceData.createdAt, serviceData.createdAt instanceof Date);
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
    } catch (error) {
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
          await sendTelegramNotification(formatServiceUpdatedNotification(notificationService, validatedUserName), "service_updated", notificationUserId,  undefined, serviceWithClient.userId || undefined);
        } else if (serviceWithClient) {
          await sendTelegramNotification(formatServiceUpdatedNotification(serviceWithClient, validatedUserName), "service_updated", notificationUserId,  undefined, serviceWithClient.userId || undefined);
        }
      }
      
      res.json(service);
    } catch (error) {
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
    } catch (error) {
      console.error("Service deletion error:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Calls
  app.get("/api/calls", async (req, res) => {
    try {
      const calls = await storage.getCalls();
      res.json(calls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calls" });
    }
  });

  app.get("/api/calls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
