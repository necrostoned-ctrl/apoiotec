import {
  clients, services, calls, quotes, financialTransactions, messages, users, templates, historyEvents, systemSettings, telegramConfig, clientNotes, notificationPreferences, knowledgeBase, preventiveMaintenance, downloadLinks, systemActivation, backupHistory, backupSchedules, backupExecutionLogs, inventoryProducts, inventoryServices, inventoryMovements,
  type Client, type InsertClient,
  type Service, type InsertService,
  type Call, type InsertCall, type CallWithClient,
  type Quote, type InsertQuote, type QuoteWithClient,
  type FinancialTransaction, type InsertFinancialTransaction, type FinancialTransactionWithClient,
  type Message, type InsertMessage,
  type User, type InsertUser,
  type Template, type InsertTemplate,
  type HistoryEvent, type InsertHistoryEvent,
  type SystemSettings, type InsertSystemSettings,
  type TelegramConfig, type InsertTelegramConfig,
  type ClientNote, type InsertClientNote,
  type NotificationPreferences, type InsertNotificationPreferences,
  type KnowledgeBase, type InsertKnowledgeBase,
  type PreventiveMaintenance, type InsertPreventiveMaintenance, type PreventiveMaintenanceWithClient,
  type DownloadLink, type InsertDownloadLink,
  type SystemActivation, type InsertSystemActivation,
  type BackupHistory, type InsertBackupHistory,
  type BackupSchedule, type InsertBackupSchedule,
  type BackupExecutionLog, type InsertBackupExecutionLog,
  type InventoryProduct, type InsertInventoryProduct,
  type InventoryService, type InsertInventoryService,
  type InventoryMovement, type InsertInventoryMovement
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, or, like, count, sum, asc, not, inArray } from "drizzle-orm";

// Helper global: converte qualquer valor em Date de forma segura
function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Client Notes
  getClientNotes(clientId: number): Promise<ClientNote[]>;
  createClientNote(note: InsertClientNote): Promise<ClientNote>;
  updateClientNote(id: number, note: Partial<InsertClientNote>): Promise<ClientNote | undefined>;
  deleteClientNote(id: number): Promise<boolean>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Calls
  getCalls(): Promise<CallWithClient[]>;
  getCall(id: number): Promise<CallWithClient | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<InsertCall>): Promise<Call | undefined>;
  deleteCall(id: number): Promise<boolean>;

  // Quotes
  getQuotes(): Promise<QuoteWithClient[]>;
  getQuote(id: number): Promise<QuoteWithClient | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;

  // Financial Transactions
  getFinancialTransactions(): Promise<FinancialTransactionWithClient[]>;
  getFinancialTransaction(id: number): Promise<FinancialTransactionWithClient | undefined>;
  getInstallmentsByParentId(parentId: number): Promise<FinancialTransaction[]>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  updateFinancialTransaction(id: number, transaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction | undefined>;
  deleteFinancialTransaction(id: number): Promise<boolean>;

  // Messages
  getMessages(): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;

  // Download Links
  getDownloadLinks(): Promise<DownloadLink[]>;
  getDownloadLink(id: number): Promise<DownloadLink | undefined>;
  createDownloadLink(link: InsertDownloadLink): Promise<DownloadLink>;
  updateDownloadLink(id: number, link: Partial<InsertDownloadLink>): Promise<DownloadLink | undefined>;
  deleteDownloadLink(id: number): Promise<boolean>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    todayCalls: number;
    openServices: number;
    monthlyRevenue: string;
    pendingItems: number;
  }>;

  // History Events
  getHistoryEventsByCallId(callId: number): Promise<HistoryEvent[]>;
  getHistoryEventsByServiceId(serviceId: number): Promise<HistoryEvent[]>;
  getHistoryEventsByTransactionId(transactionId: number): Promise<HistoryEvent[]>;
  createHistoryEvent(event: InsertHistoryEvent): Promise<HistoryEvent>;

  // System Settings
  getSystemSettings(): Promise<SystemSettings | null>;
  updateSystemSettings(settings: InsertSystemSettings): Promise<SystemSettings>;

  // Notification Preferences
  getNotificationPreferences(userId: number): Promise<NotificationPreferences[]>;
  setNotificationPreference(userId: number, notificationType: string, enabled: boolean): Promise<NotificationPreferences>;
  isNotificationEnabled(userId: number, notificationType: string): Promise<boolean>;

  // Telegram Config
  getTelegramConfig(userId: number): Promise<TelegramConfig | null>;
  getAllTelegramConfigs(): Promise<TelegramConfig[]>;
  updateTelegramConfig(userId: number, config: Partial<InsertTelegramConfig> & { userId: number }): Promise<TelegramConfig>;

  // Backup Schedules
  getBackupSchedules(userId: number): Promise<BackupSchedule[]>;
  getBackupSchedule(id: number): Promise<BackupSchedule | undefined>;
  createBackupSchedule(schedule: InsertBackupSchedule): Promise<BackupSchedule>;
  updateBackupSchedule(id: number, schedule: Partial<InsertBackupSchedule>): Promise<BackupSchedule | undefined>;
  deleteBackupSchedule(id: number): Promise<boolean>;
  getActiveBackupSchedules(): Promise<BackupSchedule[]>;

  // Backup Execution Logs
  getBackupExecutionLogs(scheduleId?: number): Promise<BackupExecutionLog[]>;
  createBackupExecutionLog(log: InsertBackupExecutionLog): Promise<BackupExecutionLog>;
  updateBackupExecutionLog(id: number, log: Partial<InsertBackupExecutionLog>): Promise<BackupExecutionLog | undefined>;

  // Inventory Products
  getInventoryProducts(): Promise<InventoryProduct[]>;
  getInventoryProduct(id: number): Promise<InventoryProduct | undefined>;
  createInventoryProduct(product: InsertInventoryProduct): Promise<InventoryProduct>;
  updateInventoryProduct(id: number, product: Partial<InsertInventoryProduct>): Promise<InventoryProduct | undefined>;
  deleteInventoryProduct(id: number): Promise<boolean>;

  // Inventory Services
  getInventoryServices(): Promise<InventoryService[]>;
  getInventoryService(id: number): Promise<InventoryService | undefined>;
  createInventoryService(service: InsertInventoryService): Promise<InventoryService>;
  updateInventoryService(id: number, service: Partial<InsertInventoryService>): Promise<InventoryService | undefined>;
  deleteInventoryService(id: number): Promise<boolean>;

  // Inventory Movements
  getInventoryMovements(): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getInventoryStats(): Promise<{ totalValue: number; criticalCount: number }>;
}


export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values({
        ...client,
        email: client.email || null,
        phone: client.phone || null,
        cpf: client.cpf || null,
        documentType: (client as any).documentType || "cpf",
        address: client.address || null,
        city: client.city || null,
        state: client.state || null,
        status: client.status || "ativo",
      })
      .returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set({
        ...client,
        email: client.email || null,
        phone: client.phone || null,
        cpf: client.cpf || null,
        documentType: (client as any).documentType || undefined,
        address: client.address || null,
        city: client.city || null,
        state: client.state || null,
      })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Client Notes
  async getClientNotes(clientId: number): Promise<ClientNote[]> {
    return await db
      .select()
      .from(clientNotes)
      .where(eq(clientNotes.clientId, clientId))
      .orderBy(desc(clientNotes.createdAt));
  }

  async createClientNote(note: InsertClientNote): Promise<ClientNote> {
    const [newNote] = await db
      .insert(clientNotes)
      .values(note)
      .returning();
    return newNote;
  }

  async updateClientNote(id: number, note: Partial<InsertClientNote>): Promise<ClientNote | undefined> {
    const [updatedNote] = await db
      .update(clientNotes)
      .set({
        ...note,
        updatedAt: new Date(),
      })
      .where(eq(clientNotes.id, id))
      .returning();
    return updatedNote || undefined;
  }

  async deleteClientNote(id: number): Promise<boolean> {
    const result = await db.delete(clientNotes).where(eq(clientNotes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getServices(): Promise<any[]> {
    try {
      const servicesData = await db.select().from(services).orderBy(desc(services.createdAt));
      return servicesData.filter(service => {
        if (!service.name || service.name.trim() === '') return false;
        return true;
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      return [];
    }
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    console.log("=== DATABASE STORAGE: Criando serviço ===");
    console.log("Dados recebidos:", service);
    console.log("ClientId a ser inserido:", service.clientId);
    console.log("CallId a ser inserido:", service.callId);
    console.log("Products a serem inseridos:", service.products);

    // FIX: garantir que todos os campos de data são Date ou null — nunca string
    const callDateSafe = toDate((service as any).callDate);
    const serviceDateSafe = toDate((service as any).serviceDate) || new Date();
    // Se createdAt foi fornecido (conversão de chamado), usar ele para preservar o timestamp original
    const createdAtSafe = toDate((service as any).createdAt);

    const insertValues: any = {
      name: service.name,
      description: service.description || null,
      basePrice: service.basePrice || null,
      estimatedTime: service.estimatedTime || null,
      category: service.category || null,
      priority: service.priority || "media",
      clientId: service.clientId || null,
      callId: service.callId || null,
      userId: service.userId || 1,
      createdByUserId: service.createdByUserId || service.userId || 1,
      products: service.products || null,
      callDate: callDateSafe,
      serviceDate: serviceDateSafe,
    };

    // Só incluir createdAt se for um Date válido (não deixar o Drizzle receber string)
    if (createdAtSafe) {
      insertValues.createdAt = createdAtSafe;
    }

    const [newService] = await db
      .insert(services)
      .values(insertValues)
      .returning();
      
    console.log("Serviço inserido no banco:", newService);
    console.log("ClientId no serviço final:", newService.clientId);
    console.log("CallId no serviço final:", newService.callId);
    console.log("Products no serviço final:", newService.products);
    
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    console.log("=== UPDATING SERVICE ===");
    console.log("Service ID:", id);
    console.log("Update data:", service);
    console.log("ServiceDate:", service.serviceDate);
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (service.name !== undefined) updateData.name = service.name;
    if (service.description !== undefined) updateData.description = service.description;
    if (service.basePrice !== undefined) updateData.basePrice = service.basePrice;
    if (service.estimatedTime !== undefined) updateData.estimatedTime = service.estimatedTime;
    if (service.category !== undefined) updateData.category = service.category;
    if ((service as any).priority !== undefined) updateData.priority = (service as any).priority;
    if (service.clientId !== undefined) updateData.clientId = service.clientId;
    if (service.products !== undefined) updateData.products = service.products;
    if (service.serviceDate !== undefined && service.serviceDate !== null) {
      updateData.serviceDate = toDate(service.serviceDate) || new Date();
    }
    if (service.userId !== undefined) updateData.userId = service.userId;
    if (service.createdByUserId !== undefined) updateData.createdByUserId = service.createdByUserId;
    
    console.log("Final update data:", updateData);
    
    const [updatedService] = await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, id))
      .returning();
      
    console.log("Service updated in DB:", updatedService);
    console.log("Updated serviceDate:", updatedService?.serviceDate);
    console.log("Updated createdAt:", updatedService?.createdAt);
    
    return updatedService || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCalls(): Promise<CallWithClient[]> {
    try {
      const allCalls = await db.select().from(calls).orderBy(desc(calls.updatedAt));
      const clientsMap = new Map<number, Client>();
      const usersMap = new Map<number, User>();
      
      if (allCalls.length > 0) {
        const clientIds = Array.from(new Set(allCalls.map(c => c.clientId).filter(id => id))) as number[];
        if (clientIds.length > 0) {
          const clientsList = await db.select().from(clients).where(inArray(clients.id, clientIds));
          clientsList.forEach(c => clientsMap.set(c.id, c));
        }
        
        const userIds = Array.from(new Set(allCalls.flatMap(c => [c.userId, c.createdByUserId]).filter(id => id))) as number[];
        if (userIds.length > 0) {
          const usersList = await db.select().from(users).where(inArray(users.id, userIds));
          usersList.forEach(u => usersMap.set(u.id, u));
        }
      }
      
      return allCalls.filter(call => {
        if (call.clientId && !clientsMap.has(call.clientId)) return false;
        if (!call.description || call.description.trim() === '') return false;
        const client = call.clientId ? clientsMap.get(call.clientId) : undefined;
        if (client && client.status === 'inativo') return false;
        return true;
      }).map(call => ({
        ...call,
        client: call.clientId ? clientsMap.get(call.clientId) || null : null,
        user: call.createdByUserId ? usersMap.get(call.createdByUserId) || null : (call.userId ? usersMap.get(call.userId) || null : null),
      })) as CallWithClient[];
    } catch (error) {
      console.error("Error fetching calls:", error);
      return [];
    }
  }

  async getCall(id: number): Promise<CallWithClient | undefined> {
    try {
      const [call] = await db.select().from(calls).where(eq(calls.id, id));
      if (!call) return undefined;
      
      let client: Client | null = null;
      let user: User | null = null;
      
      if (call.clientId) {
        const [c] = await db.select().from(clients).where(eq(clients.id, call.clientId));
        client = c || null;
      }
      
      if (call.createdByUserId) {
        const [u] = await db.select().from(users).where(eq(users.id, call.createdByUserId));
        user = u || null;
      } else if (call.userId) {
        const [u] = await db.select().from(users).where(eq(users.id, call.userId));
        user = u || null;
      }
      
      return { ...call, client, user } as CallWithClient;
    } catch (error) {
      console.error("Error fetching call:", error);
      return undefined;
    }
  }

  async createCall(call: InsertCall): Promise<Call> {
    const [newCall] = await db
      .insert(calls)
      .values({
        ...call,
        userId: call.userId || 1,
        createdByUserId: call.createdByUserId || call.userId || 1,
        status: call.status || "aguardando",
        priority: call.priority || "media",
        progress: call.progress || null,
        internalNotes: call.internalNotes || null,
      })
      .returning();
    return newCall;
  }

  async updateCall(id: number, call: Partial<InsertCall>): Promise<Call | undefined> {
    const [updatedCall] = await db
      .update(calls)
      .set({
        ...call,
        progress: call.progress || null,
        internalNotes: call.internalNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(calls.id, id))
      .returning();
    return updatedCall || undefined;
  }

  async deleteCall(id: number): Promise<boolean> {
    const result = await db.delete(calls).where(eq(calls.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getQuotes(): Promise<QuoteWithClient[]> {
    try {
      const allQuotes = await db.select().from(quotes);
      const clientsMap = new Map<number, Client>();
      if (allQuotes.length > 0) {
        const clientIds = Array.from(new Set(allQuotes.map(q => q.clientId).filter(id => id)));
        if (clientIds.length > 0) {
          const clientsList = await db.select().from(clients).where(inArray(clients.id, clientIds as number[]));
          clientsList.forEach(c => clientsMap.set(c.id, c));
        }
      }
      return allQuotes.map(q => ({
        ...q,
        client: q.clientId ? clientsMap.get(q.clientId) || null : null,
      })) as QuoteWithClient[];
    } catch (error) {
      console.error("Error fetching quotes:", error);
      return [];
    }
  }

  async getQuote(id: number): Promise<QuoteWithClient | undefined> {
    try {
      const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
      if (!quote) return undefined;
      
      let client: Client | null = null;
      if (quote.clientId) {
        const [c] = await db.select().from(clients).where(eq(clients.id, quote.clientId));
        client = c || null;
      }
      
      return { ...quote, client } as QuoteWithClient;
    } catch (error) {
      console.error("Error fetching quote:", error);
      return undefined;
    }
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db
      .insert(quotes)
      .values({
        ...quote,
        status: quote.status || "pendente",
        discount: quote.discount || null,
        validUntil: quote.validUntil || null,
      })
      .returning();
    return newQuote;
  }

  async updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        ...quote,
        discount: quote.discount || null,
        validUntil: quote.validUntil || null,
      })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote || undefined;
  }

  async deleteQuote(id: number): Promise<boolean> {
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getFinancialTransactions(): Promise<FinancialTransactionWithClient[]> {
    try {
      console.log("=== BUSCANDO TRANSAÇÕES FINANCEIRAS ===");
      
      const allTransactions = await db
        .select()
        .from(financialTransactions)
        .leftJoin(clients, eq(financialTransactions.clientId, clients.id))
        .leftJoin(calls, eq(financialTransactions.callId, calls.id))
        .leftJoin(users, eq(financialTransactions.userId, users.id))
        .orderBy(desc(financialTransactions.createdAt));

      console.log("Total de transações encontradas:", allTransactions.length);

      const result: FinancialTransactionWithClient[] = [];

      for (const row of allTransactions) {
        const transaction = row.financial_transactions;
        
        if (!transaction.description || transaction.description.trim() === '') {
          continue;
        }
        if (!transaction.amount || parseFloat(transaction.amount.toString()) <= 0) {
          continue;
        }
        
        const clientData = row.clients ? {
          ...row.clients,
          documentType: (row.clients as any).documentType || "cpf"
        } : null;
        
        const transactionData = {
          ...transaction,
          completedByUserId: transaction.completedByUserId || null,
          createdByUserId: transaction.createdByUserId || null,
          client: clientData,
          call: row.calls || null,
          user: row.users || null,
          childTransactions: []
        };
        
        result.push(transactionData as FinancialTransactionWithClient);
      }

      const allInstallments = await db
        .select()
        .from(financialTransactions)
        .where(not(isNull(financialTransactions.parentTransactionId)))
        .orderBy(asc(financialTransactions.installmentNumber));

      const installmentsByParent = new Map<number, any[]>();
      for (const installment of allInstallments) {
        if (installment.parentTransactionId) {
          if (!installmentsByParent.has(installment.parentTransactionId)) {
            installmentsByParent.set(installment.parentTransactionId, []);
          }
          installmentsByParent.get(installment.parentTransactionId)!.push(installment);
        }
      }

      for (const transaction of result) {
        if (installmentsByParent.has(transaction.id)) {
          transaction.childTransactions = installmentsByParent.get(transaction.id) || [];
        }
      }

      console.log("Transações retornadas:", result.length);
      console.log("Parcelas totais encontradas:", allInstallments.length);
      return result;
    } catch (error) {
      console.error("Error fetching financial transactions:", error);
      return [];
    }
  }

  async getFinancialTransaction(id: number): Promise<FinancialTransactionWithClient | undefined> {
    try {
      const transactionRows = await db
        .select()
        .from(financialTransactions)
        .leftJoin(clients, eq(financialTransactions.clientId, clients.id))
        .leftJoin(calls, eq(financialTransactions.callId, calls.id))
        .leftJoin(users, eq(financialTransactions.userId, users.id))
        .where(eq(financialTransactions.id, id));

      if (transactionRows.length === 0) return undefined;

      const row = transactionRows[0];
      const transaction = row.financial_transactions;

      const childTransactionRows = await db
        .select()
        .from(financialTransactions)
        .where(eq(financialTransactions.parentTransactionId, id))
        .orderBy(asc(financialTransactions.installmentNumber));

      const clientData = row.clients ? {
        ...row.clients,
        documentType: (row.clients as any).documentType || "cpf"
      } : null;

      return {
        ...transaction,
        completedByUserId: transaction.completedByUserId || null,
        createdByUserId: transaction.createdByUserId || null,
        client: clientData,
        call: row.calls || null,
        user: row.users || null,
        childTransactions: childTransactionRows as FinancialTransactionWithClient[]
      } as FinancialTransactionWithClient;
    } catch (error) {
      console.error("Error fetching financial transaction:", error);
      return undefined;
    }
  }

  async createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    console.log("=== DATABASE: Criando transação financeira ===");
    console.log("Dados recebidos:", transaction);
    console.log("ClientId a inserir:", transaction.clientId);
    console.log("STATUS RECEBIDO NO STORAGE:", transaction.status);

    const statusToUse = transaction.status || "pendente";
    console.log("STATUS QUE SERÁ USADO:", statusToUse);

    const insertData: any = {
      description: transaction.description,
      resolution: transaction.resolution || null,
      clientId: transaction.clientId,
      callId: transaction.callId || null,
      serviceId: transaction.serviceId || null,
      userId: transaction.userId || 1,
      createdByUserId: transaction.createdByUserId || transaction.userId || 1,
      type: transaction.type,
      amount: transaction.amount,
      originalAmount: transaction.originalAmount || null,
      discountAmount: transaction.discountAmount || "0",
      status: statusToUse,
      dueDate: transaction.dueDate || null,
      paidAt: transaction.paidAt || null,
      completedAt: transaction.completedAt || null,
      completedByUserId: transaction.completedByUserId || null,
      parentTransactionId: transaction.parentTransactionId || null,
      installmentNumber: transaction.installmentNumber || null,
      serviceAmount: transaction.serviceAmount || null,
      productAmount: transaction.productAmount || null,
      serviceDetails: transaction.serviceDetails || null,
      productDetails: transaction.productDetails || null,
      createdAt: new Date(),
    };

    const [newTransaction] = await db
      .insert(financialTransactions)
      .values(insertData)
      .returning();
      
    console.log("Transação criada no banco:", newTransaction);
    console.log("ClientId final:", newTransaction.clientId);
    console.log("CreatedAt no banco:", newTransaction.createdAt);
    console.log("STATUS FINAL DA TRANSAÇÃO CRIADA:", newTransaction.status);
    
    return newTransaction;
  }

  async updateFinancialTransaction(id: number, transaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction | undefined> {
    const [current] = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.id, id));
    
    if (!current) {
      console.error("Transaction not found for update:", id);
      return undefined;
    }
    
    console.log("=== ANTES DA ATUALIZAÇÃO ===");
    console.log("Current clientId:", current.clientId);
    console.log("Update data:", transaction);
    
    const updateData: any = {};
    
    if (transaction.description !== undefined) updateData.description = transaction.description;
    if (transaction.resolution !== undefined) updateData.resolution = transaction.resolution;
    if (transaction.clientId !== undefined) updateData.clientId = transaction.clientId;
    if (transaction.callId !== undefined) updateData.callId = transaction.callId;
    if (transaction.serviceId !== undefined) updateData.serviceId = transaction.serviceId;
    if (transaction.userId !== undefined) updateData.userId = transaction.userId;
    if (transaction.createdByUserId !== undefined) updateData.createdByUserId = transaction.createdByUserId;
    if (transaction.completedByUserId !== undefined) updateData.completedByUserId = transaction.completedByUserId;
    if (transaction.type !== undefined) updateData.type = transaction.type;
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.originalAmount !== undefined) updateData.originalAmount = transaction.originalAmount;
    if (transaction.discountAmount !== undefined) updateData.discountAmount = transaction.discountAmount;
    if (transaction.status !== undefined) updateData.status = transaction.status;
    if (transaction.dueDate !== undefined) updateData.dueDate = transaction.dueDate;
    if (transaction.paidAt !== undefined) updateData.paidAt = transaction.paidAt;
    if (transaction.completedAt !== undefined) updateData.completedAt = transaction.completedAt;
    if (transaction.serviceAmount !== undefined) updateData.serviceAmount = transaction.serviceAmount;
    if (transaction.productAmount !== undefined) updateData.productAmount = transaction.productAmount;
    if (transaction.serviceDetails !== undefined) updateData.serviceDetails = transaction.serviceDetails;
    if (transaction.productDetails !== undefined) updateData.productDetails = transaction.productDetails;
    
    if (transaction.createdAt !== undefined) {
      updateData.createdAt = transaction.createdAt;
      updateData.billingDate = transaction.createdAt;
      console.log("=== ATUALIZANDO createdAt E billingDate ===", transaction.createdAt);
    }
    
    updateData.updatedAt = new Date();
    
    console.log("=== DADOS PARA ATUALIZAÇÃO ===");
    console.log("UpdateData:", updateData);
    console.log("Resolution field:", updateData.resolution);
    console.log("ClientId será preservado:", !updateData.hasOwnProperty('clientId') ? current.clientId : updateData.clientId);
    
    const [updatedTransaction] = await db
      .update(financialTransactions)
      .set(updateData)
      .where(eq(financialTransactions.id, id))
      .returning();
    
    console.log("=== RESULTADO FINAL ===");
    console.log("Final clientId:", updatedTransaction.clientId);
    console.log("Final createdByUserId:", updatedTransaction.createdByUserId);
    console.log("Final resolution:", updatedTransaction.resolution);
    console.log("Final createdAt:", updatedTransaction.createdAt);
    console.log("Updated transaction:", updatedTransaction);
    
    return updatedTransaction || undefined;
  }

  async getInstallmentsByParentId(parentId: number): Promise<FinancialTransaction[]> {
    try {
      const installments = await db
        .select()
        .from(financialTransactions)
        .where(eq(financialTransactions.parentTransactionId, parentId))
        .orderBy(financialTransactions.installmentNumber);
      
      return installments;
    } catch (error) {
      console.error("Error getting installments by parent ID:", error);
      return [];
    }
  }

  async deleteFinancialTransaction(id: number): Promise<boolean> {
    try {
      console.log(`=== DELETANDO TRANSAÇÃO ${id} ===`);
      
      const transaction = await db.select().from(financialTransactions).where(eq(financialTransactions.id, id)).limit(1);
      if (transaction.length === 0) {
        console.log("Transação não encontrada");
        return false;
      }
      
      const deleteChildrenRecursively = async (parentId: number): Promise<void> => {
        const children = await db.select().from(financialTransactions).where(eq(financialTransactions.parentTransactionId, parentId));
        
        for (const child of children) {
          await deleteChildrenRecursively(child.id);
          await db.delete(financialTransactions).where(eq(financialTransactions.id, child.id));
          console.log(`Excluída parcela filha: ${child.id}`);
        }
      };
      
      await deleteChildrenRecursively(id);
      
      const result = await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
      const rowsDeleted = result.rowCount || 0;
      console.log(`Transação principal excluída: ${rowsDeleted > 0}`);
      
      return rowsDeleted > 0;
    } catch (error) {
      console.error("Transaction deletion error:", error);
      throw error;
    }
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set(message)
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage || undefined;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Download Links
  async getDownloadLinks(): Promise<DownloadLink[]> {
    return await db.select().from(downloadLinks).orderBy(desc(downloadLinks.createdAt));
  }

  async getDownloadLink(id: number): Promise<DownloadLink | undefined> {
    const [link] = await db.select().from(downloadLinks).where(eq(downloadLinks.id, id));
    return link || undefined;
  }

  async createDownloadLink(link: InsertDownloadLink): Promise<DownloadLink> {
    const [newLink] = await db
      .insert(downloadLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async updateDownloadLink(id: number, link: Partial<InsertDownloadLink>): Promise<DownloadLink | undefined> {
    const [updated] = await db
      .update(downloadLinks)
      .set(link)
      .where(eq(downloadLinks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDownloadLink(id: number): Promise<boolean> {
    const result = await db.delete(downloadLinks).where(eq(downloadLinks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const userData: any = { ...user };
    const [newUser] = await db
      .insert(users)
      .values(userData)
      .returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const cleanedUser: any = {
      ...user,
      username: user.username ? user.username.trim() : user.username,
      name: user.name ? user.name.trim() : user.name,
      email: user.email ? user.email.trim() : user.email,
    };

    const [updatedUser] = await db
      .update(users)
      .set(cleanedUser)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getDashboardStats(): Promise<{
    todayCalls: number;
    openServices: number;
    monthlyRevenue: string;
    pendingItems: number;
  }> {
    try {
      const allCalls = await db.select().from(calls);
      const clientsList = await db.select().from(clients);
      const clientsMap = new Map(clientsList.map(c => [c.id, c]));
      
      const validCalls = allCalls.filter(call => {
        if (call.clientId && !clientsMap.has(call.clientId)) return false;
        if (!call.serviceType || call.serviceType.trim() === '') return false;
        if (!call.description || call.description.trim() === '') return false;
        const client = call.clientId ? clientsMap.get(call.clientId) : undefined;
        if (client && client.status === 'inativo') return false;
        return true;
      });
      
      const allServices = await db.select().from(services);
      const allTransactions = await db.select().from(financialTransactions);
      const allQuotes = await db.select().from(quotes);
      
      const todayCalls = validCalls.filter(call => 
        call.status === "aguardando" || call.status === "aguardando_orcamento"
      ).length;

      const openServices = allServices.length;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthlyRevenue = allTransactions
        .filter(t => {
          const transactionDate = new Date(t.createdAt);
          return t.type === "entrada" && transactionDate >= firstDayOfMonth;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const pendingItems = allQuotes
        .filter(q => q.status === "pendente")
        .length;

      return {
        todayCalls,
        openServices,
        monthlyRevenue: monthlyRevenue.toFixed(2),
        pendingItems,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        todayCalls: 0,
        openServices: 0,
        monthlyRevenue: "0.00",
        pendingItems: 0,
      };
    }
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    try {
      console.log("Storage: Getting templates from database");
      const templatesList = await db.select().from(templates).orderBy(desc(templates.createdAt));
      console.log("Storage: Found templates:", templatesList.length);
      return templatesList;
    } catch (error) {
      console.error("Storage: Error getting templates:", error);
      return [];
    }
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    try {
      console.log("Storage: Getting template by id:", id);
      const [template] = await db.select().from(templates).where(eq(templates.id, id));
      console.log("Storage: Template found:", template ? `ID: ${template.id}` : "not found");
      return template || undefined;
    } catch (error) {
      console.error("Storage: Error getting template:", error);
      return undefined;
    }
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    try {
      console.log("Storage: Creating template");
      const templateData: any = {
        ...template,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const [newTemplate] = await db
        .insert(templates)
        .values(templateData)
        .returning();
      console.log("Storage: Template created with id:", newTemplate.id);
      return newTemplate;
    } catch (error) {
      console.error("Storage: Error creating template:", error);
      throw error;
    }
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    try {
      console.log("Storage: Updating template:", id, "with data:", Object.keys(template));
      const templateData: any = {
        ...template,
        updatedAt: new Date(),
      };
      const [updatedTemplate] = await db
        .update(templates)
        .set(templateData)
        .where(eq(templates.id, id))
        .returning();
      console.log("Storage: Template updated:", updatedTemplate ? "success" : "not found");
      return updatedTemplate || undefined;
    } catch (error) {
      console.error("Storage: Error updating template:", error);
      throw error;
    }
  }

  async deleteTemplate(id: number): Promise<boolean> {
    try {
      console.log("Storage: Deleting template:", id);
      const result = await db.delete(templates).where(eq(templates.id, id));
      const success = (result.rowCount ?? 0) > 0;
      console.log("Storage: Template deleted:", success);
      return success;
    } catch (error) {
      console.error("Storage: Error deleting template:", error);
      return false;
    }
  }

  // History Events
  async getHistoryEventsByCallId(callId: number): Promise<HistoryEvent[]> {
    return await db.select().from(historyEvents).where(eq(historyEvents.callId, callId)).orderBy(historyEvents.createdAt);
  }

  async getHistoryEventsByServiceId(serviceId: number): Promise<HistoryEvent[]> {
    const relevantEventTypes = ['call_created', 'converted_to_service', 'service_updated', 'converted_to_financial', 'payment_received'];
    
    const serviceEvents = await db.select().from(historyEvents).where(eq(historyEvents.serviceId, serviceId));
    
    const conversionEvent = serviceEvents.find(e => e.callId !== null);
    if (conversionEvent?.callId) {
      const callEvents = await db.select().from(historyEvents).where(eq(historyEvents.callId, conversionEvent.callId));
      const allEvents = [...callEvents, ...serviceEvents];
      const uniqueMap = new Map();
      allEvents.forEach(e => {
        if (relevantEventTypes.includes(e.eventType)) {
          const key = `${e.callId || 'null'}-${e.serviceId || 'null'}-${e.eventType}-${e.createdAt}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, e);
          }
        }
      });
      const uniqueEvents = Array.from(uniqueMap.values());
      return uniqueEvents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    const filtered = serviceEvents.filter(e => relevantEventTypes.includes(e.eventType));
    return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getHistoryEventsByTransactionId(transactionId: number): Promise<HistoryEvent[]> {
    const transaction = await db.query.financialTransactions.findFirst({
      where: eq(financialTransactions.id, transactionId),
    });

    if (!transaction) {
      return [];
    }

    const relevantEventTypes = ['call_created', 'converted_to_service', 'service_updated', 'converted_to_financial', 'payment_received'];

    const allEvents: HistoryEvent[] = [];
    
    const transactionEvents = await db.select().from(historyEvents).where(eq(historyEvents.transactionId, transactionId));
    allEvents.push(...transactionEvents);
    
    if (transaction.serviceId) {
      const serviceEvents = await db.select().from(historyEvents).where(eq(historyEvents.serviceId, transaction.serviceId));
      allEvents.push(...serviceEvents);
    }
    
    if (transaction.callId) {
      const callEvents = await db.select().from(historyEvents).where(eq(historyEvents.callId, transaction.callId));
      allEvents.push(...callEvents);
    }
    
    const uniqueMap = new Map();
    allEvents.forEach(e => {
      if (relevantEventTypes.includes(e.eventType)) {
        const key = `${e.callId || 'null'}-${e.serviceId || 'null'}-${e.transactionId || 'null'}-${e.eventType}-${e.createdAt}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, e);
        }
      }
    });
    const uniqueEvents = Array.from(uniqueMap.values());
    return uniqueEvents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createHistoryEvent(event: InsertHistoryEvent): Promise<HistoryEvent> {
    const [newEvent] = await db.insert(historyEvents).values(event).returning();
    return newEvent;
  }

  async getSystemSettings(): Promise<SystemSettings | null> {
    const settings = await db.query.systemSettings.findFirst();
    return settings || null;
  }

  async updateSystemSettings(settings: InsertSystemSettings): Promise<SystemSettings> {
    const existing = await this.getSystemSettings();
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({...settings, updatedAt: new Date()})
        .where(eq(systemSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  async getTelegramConfig(userId: number): Promise<TelegramConfig | null> {
    const config = await db.query.telegramConfig.findFirst({
      where: eq(telegramConfig.userId, userId),
    });
    return config || null;
  }

  async getAllTelegramConfigs(): Promise<TelegramConfig[]> {
    const configs = await db.select().from(telegramConfig);
    return configs;
  }

  async updateTelegramConfig(userId: number, config: InsertTelegramConfig): Promise<TelegramConfig> {
    const existing = await this.getTelegramConfig(userId);
    
    if (existing) {
      const [updated] = await db
        .update(telegramConfig)
        .set({
          botToken: config.botToken,
          chatId: config.chatId,
          isActive: config.isActive !== undefined ? config.isActive : true,
          updatedAt: new Date()
        })
        .where(eq(telegramConfig.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(telegramConfig)
        .values({
          botToken: config.botToken,
          chatId: config.chatId,
          isActive: config.isActive !== undefined ? config.isActive : true,
          userId
        })
        .returning();
      return created;
    }
  }

  // Notification Preferences
  async getNotificationPreferences(userId: number): Promise<NotificationPreferences[]> {
    return db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  }

  private async getNotificationPreference(userId: number, notificationType: string): Promise<NotificationPreferences | undefined> {
    const prefs = await db.select().from(notificationPreferences)
      .where(and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.notificationType, notificationType)
      ));
    return prefs[0];
  }

  async setNotificationPreference(userId: number, notificationType: string, enabled: boolean): Promise<NotificationPreferences> {
    const existing = await this.getNotificationPreference(userId, notificationType);
    
    if (existing) {
      const [updated] = await db
        .update(notificationPreferences)
        .set({ enabled, updatedAt: new Date() })
        .where(and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.notificationType, notificationType)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(notificationPreferences)
        .values({ userId, notificationType, enabled })
        .returning();
      return created;
    }
  }

  async isNotificationEnabled(userId: number, notificationType: string): Promise<boolean> {
    const pref = await this.getNotificationPreference(userId, notificationType);
    if (!pref) {
      try {
        const created = await this.setNotificationPreference(userId, notificationType, true);
        return created?.enabled ?? true;
      } catch {
        return true;
      }
    }
    return pref?.enabled ?? true;
  }

  // Knowledge Base
  async getKnowledgeBase(): Promise<KnowledgeBase[]> {
    return await db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.createdAt));
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeBase | undefined> {
    const articles = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return articles[0];
  }

  async createKnowledgeArticle(article: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [created] = await db.insert(knowledgeBase).values(article).returning();
    return created;
  }

  async updateKnowledgeArticle(id: number, article: Partial<InsertKnowledgeBase>): Promise<KnowledgeBase | undefined> {
    const [updated] = await db.update(knowledgeBase).set({ ...article, updatedAt: new Date() }).where(eq(knowledgeBase.id, id)).returning();
    return updated;
  }

  async deleteKnowledgeArticle(id: number): Promise<boolean> {
    const result = await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Preventive Maintenance
  async getPreventiveMaintenances(): Promise<PreventiveMaintenanceWithClient[]> {
    try {
      const maintenances = await db.select().from(preventiveMaintenance).orderBy(desc(preventiveMaintenance.scheduledDate));
      return await Promise.all(
        maintenances.map(async (m) => {
          try {
            const client = await this.getClient(m.clientId);
            return {
              ...m,
              client: client || undefined
            };
          } catch (err) {
            console.error(`Erro ao buscar cliente ${m.clientId}:`, err);
            return {
              ...m,
              client: undefined
            };
          }
        })
      );
    } catch (err) {
      console.error("Erro em getPreventiveMaintenances:", err);
      return [];
    }
  }

  async getPreventiveMaintenance(id: number): Promise<PreventiveMaintenanceWithClient | undefined> {
    const m = await db.select().from(preventiveMaintenance).where(eq(preventiveMaintenance.id, id));
    if (!m[0]) return undefined;
    return {
      ...m[0],
      client: await this.getClient(m[0].clientId)
    };
  }

  async createPreventiveMaintenance(maintenance: InsertPreventiveMaintenance): Promise<PreventiveMaintenance> {
    const [created] = await db.insert(preventiveMaintenance).values(maintenance).returning();
    return created;
  }

  async updatePreventiveMaintenance(id: number, maintenance: Partial<InsertPreventiveMaintenance>): Promise<PreventiveMaintenance | undefined> {
    const [updated] = await db.update(preventiveMaintenance).set({ ...maintenance, updatedAt: new Date() }).where(eq(preventiveMaintenance.id, id)).returning();
    return updated;
  }

  async deletePreventiveMaintenance(id: number): Promise<boolean> {
    const result = await db.delete(preventiveMaintenance).where(eq(preventiveMaintenance.id, id));
    return result.rowCount ? true : false;
  }

  async completePreventiveMaintenance(id: number): Promise<PreventiveMaintenance | undefined> {
    const [updated] = await db.update(preventiveMaintenance).set({ status: "concluido", completedDate: new Date(), updatedAt: new Date() }).where(eq(preventiveMaintenance.id, id)).returning();
    return updated;
  }

  // ============================================================================
  // SISTEMA DE ATIVAÇÃO
  // ============================================================================
  async getActivation(): Promise<SystemActivation | undefined> {
    const result = await db.select().from(systemActivation);
    return result[0];
  }

  async createActivation(data: InsertSystemActivation): Promise<SystemActivation> {
    const [created] = await db.insert(systemActivation).values(data).returning();
    return created;
  }

  async updateActivation(data: Partial<InsertSystemActivation>): Promise<SystemActivation | undefined> {
    const [updated] = await db.update(systemActivation).set(data).where(eq(systemActivation.id, 1)).returning();
    return updated;
  }

  async recordFailedAttempt(): Promise<void> {
    const current = await this.getActivation();
    if (current) {
      const failedAttempts = (current.failedAttempts || 0) + 1;
      let blockedUntil = null;
      
      if (failedAttempts >= 5) {
        const delaySeconds = 30 + ((failedAttempts - 5) * 10);
        blockedUntil = new Date(Date.now() + delaySeconds * 1000);
      }

      await this.updateActivation({
        failedAttempts,
        blockedUntil,
        lastAttempt: new Date()
      });
    }
  }

  async resetFailedAttempts(): Promise<void> {
    const current = await this.getActivation();
    if (current) {
      await this.updateActivation({
        failedAttempts: 0,
        blockedUntil: null,
        lastAttempt: new Date()
      });
    }
  }

  async deleteActivation(): Promise<boolean> {
    const result = await db.delete(systemActivation);
    return (result.rowCount ?? 0) > 0;
  }

  // ============================================================================
  // BACKUPS
  // ============================================================================
  async getBackupHistory(): Promise<BackupHistory[]> {
    return db.select().from(backupHistory).orderBy(desc(backupHistory.createdAt));
  }

  async createBackupRecord(data: InsertBackupHistory): Promise<BackupHistory> {
    const [created] = await db.insert(backupHistory).values(data).returning();
    return created;
  }

  async deleteBackupRecord(id: number): Promise<boolean> {
    const result = await db.delete(backupHistory).where(eq(backupHistory.id, id));
    return result.rowCount ? true : false;
  }

  // Backup Schedules
  async getBackupSchedules(userId: number): Promise<BackupSchedule[]> {
    return db.select().from(backupSchedules).where(eq(backupSchedules.userId, userId)).orderBy(desc(backupSchedules.createdAt));
  }

  async getBackupSchedule(id: number): Promise<BackupSchedule | undefined> {
    const [schedule] = await db.select().from(backupSchedules).where(eq(backupSchedules.id, id));
    return schedule || undefined;
  }

  async createBackupSchedule(schedule: InsertBackupSchedule): Promise<BackupSchedule> {
    const [created] = await db.insert(backupSchedules).values(schedule).returning();
    return created;
  }

  async updateBackupSchedule(id: number, schedule: Partial<InsertBackupSchedule>): Promise<BackupSchedule | undefined> {
    const [updated] = await db.update(backupSchedules).set({ ...schedule, updatedAt: new Date() }).where(eq(backupSchedules.id, id)).returning();
    return updated || undefined;
  }

  async deleteBackupSchedule(id: number): Promise<boolean> {
    const result = await db.delete(backupSchedules).where(eq(backupSchedules.id, id));
    return result.rowCount ? true : false;
  }

  async getActiveBackupSchedules(): Promise<BackupSchedule[]> {
    return db.select().from(backupSchedules).where(eq(backupSchedules.isActive, true));
  }

  // Backup Execution Logs
  async getBackupExecutionLogs(scheduleId?: number): Promise<BackupExecutionLog[]> {
    if (scheduleId) {
      return db.select().from(backupExecutionLogs).where(eq(backupExecutionLogs.scheduleId, scheduleId)).orderBy(desc(backupExecutionLogs.createdAt));
    }
    return db.select().from(backupExecutionLogs).orderBy(desc(backupExecutionLogs.createdAt));
  }

  async createBackupExecutionLog(log: InsertBackupExecutionLog): Promise<BackupExecutionLog> {
    const [created] = await db.insert(backupExecutionLogs).values(log).returning();
    return created;
  }

  async updateBackupExecutionLog(id: number, log: Partial<InsertBackupExecutionLog>): Promise<BackupExecutionLog | undefined> {
    const [updated] = await db.update(backupExecutionLogs).set(log).where(eq(backupExecutionLogs.id, id)).returning();
    return updated || undefined;
  }

  async deleteBackupExecutionLog(id: number): Promise<boolean> {
    const result = await db.delete(backupExecutionLogs).where(eq(backupExecutionLogs.id, id));
    return result.rowCount ? true : false;
  }

  async clearAllBackupExecutionLogs(): Promise<number> {
    const result = await db.delete(backupExecutionLogs);
    return result.rowCount || 0;
  }

  // ============================================================================
  // INVENTORY PRODUCTS
  // ============================================================================
  async getInventoryProducts(): Promise<InventoryProduct[]> {
    return await db.select().from(inventoryProducts).orderBy(desc(inventoryProducts.createdAt));
  }

  async getInventoryProduct(id: number): Promise<InventoryProduct | undefined> {
    const [product] = await db.select().from(inventoryProducts).where(eq(inventoryProducts.id, id));
    return product || undefined;
  }

  async createInventoryProduct(product: InsertInventoryProduct): Promise<InventoryProduct> {
    const [newProduct] = await db.insert(inventoryProducts).values(product).returning();
    return newProduct;
  }

  async updateInventoryProduct(id: number, product: Partial<InsertInventoryProduct>): Promise<InventoryProduct | undefined> {
    const [updated] = await db
      .update(inventoryProducts)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(inventoryProducts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInventoryProduct(id: number): Promise<boolean> {
    const result = await db.delete(inventoryProducts).where(eq(inventoryProducts.id, id));
    return result.rowCount ? true : false;
  }

  // ============================================================================
  // INVENTORY SERVICES
  // ============================================================================
  async getInventoryServices(): Promise<InventoryService[]> {
    return await db.select().from(inventoryServices).orderBy(desc(inventoryServices.createdAt));
  }

  async getInventoryService(id: number): Promise<InventoryService | undefined> {
    const [service] = await db.select().from(inventoryServices).where(eq(inventoryServices.id, id));
    return service || undefined;
  }

  async createInventoryService(service: InsertInventoryService): Promise<InventoryService> {
    const [newService] = await db.insert(inventoryServices).values(service).returning();
    return newService;
  }

  async updateInventoryService(id: number, service: Partial<InsertInventoryService>): Promise<InventoryService | undefined> {
    const [updated] = await db
      .update(inventoryServices)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(inventoryServices.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInventoryService(id: number): Promise<boolean> {
    const result = await db.delete(inventoryServices).where(eq(inventoryServices.id, id));
    return result.rowCount ? true : false;
  }

  // ============================================================================
  // INVENTORY MOVEMENTS & STATS
  // ============================================================================
  async getInventoryMovements(): Promise<InventoryMovement[]> {
    return await db.select().from(inventoryMovements).orderBy(desc(inventoryMovements.createdAt));
  }

  async createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [newMovement] = await db.insert(inventoryMovements).values(movement).returning();
    return newMovement;
  }

  async getInventoryStats(): Promise<{ totalValue: number; criticalCount: number }> {
    const products = await db.select().from(inventoryProducts);
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price.toString()) * parseInt(p.quantity.toString())), 0);
    const criticalCount = products.filter(p => parseInt(p.quantity.toString()) <= p.minAlert).length;
    return { totalValue, criticalCount };
  }
}

export const storage = new DatabaseStorage();
