import { db } from "./db";
import { 
  clients, calls, quotes, users, services, 
  financialTransactions, messages, downloadLinks, systemSettings, templates, clientNotes,
  historyEvents,
  telegramConfig,
  notificationPreferences,
  knowledgeBase,
  preventiveMaintenance,
  systemActivation,
  backupHistory,
  backupSchedules,
  backupExecutionLogs,
  inventoryProducts,
  inventoryServices,
  inventoryMovements,
  digitalCertificates,
  signatureAuditLog,
  signatureAttempts,
  type Client, type InsertClient,
  type Call, type InsertCall,
  type Quote, type InsertQuote,
  type User, type InsertUser,
  type Service, type InsertService,
  type FinancialTransaction, type InsertFinancialTransaction,
  type Message, type InsertMessage,
  type DownloadLink, type InsertDownloadLink,
  type SystemSettings, type InsertSystemSettings,
  type Template, type InsertTemplate,
  type ClientNote, type InsertClientNote,
  type HistoryEvent, type InsertHistoryEvent,
  type TelegramConfig, type InsertTelegramConfig,
  type NotificationPreferences, type InsertNotificationPreferences,
  type KnowledgeBase, type InsertKnowledgeBase,
  type PreventiveMaintenance, type InsertPreventiveMaintenance,
  type SystemActivation, type InsertSystemActivation,
  type BackupHistory, type InsertBackupHistory,
  type BackupSchedule, type InsertBackupSchedule,
  type BackupExecutionLog, type InsertBackupExecutionLog,
  type InventoryProduct, type InsertInventoryProduct,
  type InventoryService, type InsertInventoryService,
  type InventoryMovement, type InsertInventoryMovement,
  type DigitalCertificate, type InsertDigitalCertificate,
  type SignatureAuditLog, type InsertSignatureAuditLog
} from "@shared/schema";
import { eq, desc, and, or, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Clientes
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<void>;

  // Notas de Cliente
  getClientNotes(clientId: number): Promise<ClientNote[]>;
  createClientNote(note: InsertClientNote): Promise<ClientNote>;
  deleteClientNote(id: number): Promise<void>;

  // Chamados (Calls)
  getCalls(): Promise<Call[]>;
  getCall(id: number): Promise<Call | undefined>;
  getCallsByClient(clientId: number): Promise<Call[]>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<Call>): Promise<Call | undefined>;
  updateCallProgress(id: number, progress: number): Promise<Call | undefined>;
  deleteCall(id: number): Promise<void>;
  getCompletedCallsCount(startDate: Date, endDate: Date): Promise<number>;
  getTotalCompletedCalls(): Promise<number>;
  getOpenCallsCount(): Promise<number>;

  // Orçamentos (Quotes)
  getQuotes(): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<Quote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<void>;
  getQuotesByDateRange(startDate: Date, endDate: Date): Promise<Quote[]>;

  // Serviços (Services)
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServicesByCallId(callId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  // Histórico (History)
  getHistoryEvents(): Promise<HistoryEvent[]>;
  getHistoryByCallId(callId: number): Promise<HistoryEvent[]>;
  getHistoryByServiceId(serviceId: number): Promise<HistoryEvent[]>;
  getHistoryByTransactionId(transactionId: number): Promise<HistoryEvent[]>;
  createHistoryEvent(event: InsertHistoryEvent): Promise<HistoryEvent>;

  // Financeiro (Financial Transactions)
  getFinancialTransactions(): Promise<FinancialTransaction[]>;
  getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  updateFinancialTransaction(id: number, transaction: Partial<FinancialTransaction>): Promise<FinancialTransaction | undefined>;
  deleteFinancialTransaction(id: number): Promise<void>;
  getFinancialTransactionsByDateRange(startDate: Date, endDate: Date): Promise<FinancialTransaction[]>;
  getDashboardStats(): Promise<any>;
  generatePixCode(amount: number): string;
  createInstallments(transactionId: number, installments: number): Promise<FinancialTransaction[]>;
  getChildTransactions(parentId: number): Promise<FinancialTransaction[]>;

  // Base de Conhecimento
  getKnowledgeBaseItems(): Promise<KnowledgeBase[]>;
  getKnowledgeBaseItem(id: number): Promise<KnowledgeBase | undefined>;
  createKnowledgeBaseItem(item: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBaseItem(id: number, item: Partial<KnowledgeBase>): Promise<KnowledgeBase | undefined>;
  deleteKnowledgeBaseItem(id: number): Promise<void>;
  incrementKnowledgeBaseViews(id: number): Promise<void>;
  incrementKnowledgeBaseHelpful(id: number): Promise<void>;

  // Manutenção Preventiva
  getPreventiveMaintenances(): Promise<(PreventiveMaintenance & { client: Client })[]>;
  getPreventiveMaintenance(id: number): Promise<PreventiveMaintenance | undefined>;
  getPreventiveMaintenancesByClient(clientId: number): Promise<PreventiveMaintenance[]>;
  createPreventiveMaintenance(maintenance: InsertPreventiveMaintenance): Promise<PreventiveMaintenance>;
  updatePreventiveMaintenance(id: number, maintenance: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance | undefined>;
  deletePreventiveMaintenance(id: number): Promise<void>;

  // Configurações e Templates
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
  getTemplate(id: number): Promise<Template | undefined>;
  updateTemplate(id: number, template: Partial<Template>): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // Telegram
  getTelegramConfig(userId: number): Promise<TelegramConfig | undefined>;
  updateTelegramConfig(userId: number, config: Partial<TelegramConfig>): Promise<TelegramConfig>;
  createTelegramConfig(config: InsertTelegramConfig): Promise<TelegramConfig>;

  getNotificationPreferences(userId: number): Promise<NotificationPreferences[]>;
  updateNotificationPreference(userId: number, type: string, enabled: boolean): Promise<NotificationPreferences>;

  // Mensagens
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  
  // Links de Download
  getDownloadLinks(): Promise<DownloadLink[]>;
  createDownloadLink(link: InsertDownloadLink): Promise<DownloadLink>;
  deleteDownloadLink(id: number): Promise<void>;

  // Sistema de Ativação
  getActivationConfig(): Promise<SystemActivation | undefined>;
  updateActivationConfig(config: Partial<SystemActivation>): Promise<SystemActivation>;
  createActivationConfig(config: InsertSystemActivation): Promise<SystemActivation>;

  // Backups
  getBackupHistory(): Promise<BackupHistory[]>;
  createBackupHistory(backup: InsertBackupHistory): Promise<BackupHistory>;
  updateBackupHistory(id: number, backup: Partial<BackupHistory>): Promise<BackupHistory | undefined>;
  
  getBackupSchedules(): Promise<BackupSchedule[]>;
  getBackupSchedule(id: number): Promise<BackupSchedule | undefined>;
  getActiveBackupSchedules(): Promise<BackupSchedule[]>;
  createBackupSchedule(schedule: InsertBackupSchedule): Promise<BackupSchedule>;
  updateBackupSchedule(id: number, schedule: Partial<BackupSchedule>): Promise<BackupSchedule | undefined>;
  deleteBackupSchedule(id: number): Promise<void>;
  
  getBackupExecutionLogs(scheduleId?: number): Promise<BackupExecutionLog[]>;
  createBackupExecutionLog(log: InsertBackupExecutionLog): Promise<BackupExecutionLog>;
  updateBackupExecutionLog(id: number, log: Partial<BackupExecutionLog>): Promise<BackupExecutionLog | undefined>;

  // Produtos e Serviços (Estoque)
  getInventoryProducts(): Promise<InventoryProduct[]>;
  getInventoryProduct(id: number): Promise<InventoryProduct | undefined>;
  createInventoryProduct(product: InsertInventoryProduct): Promise<InventoryProduct>;
  updateInventoryProduct(id: number, product: Partial<InventoryProduct>): Promise<InventoryProduct | undefined>;
  deleteInventoryProduct(id: number): Promise<void>;

  getInventoryServices(): Promise<InventoryService[]>;
  getInventoryService(id: number): Promise<InventoryService | undefined>;
  createInventoryService(service: InsertInventoryService): Promise<InventoryService>;
  updateInventoryService(id: number, service: Partial<InventoryService>): Promise<InventoryService | undefined>;
  deleteInventoryService(id: number): Promise<void>;

  getInventoryMovements(productId: number): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;

  // Certificados e Assinatura Digital
  getDigitalCertificates(): Promise<DigitalCertificate[]>;
  getDigitalCertificate(id: number): Promise<DigitalCertificate | undefined>;
  createDigitalCertificate(certificate: InsertDigitalCertificate): Promise<DigitalCertificate>;
  updateDigitalCertificate(id: number, certificate: Partial<DigitalCertificate>): Promise<DigitalCertificate | undefined>;
  deleteDigitalCertificate(id: number): Promise<void>;
  
  getSignatureAuditLogs(): Promise<SignatureAuditLog[]>;
  createSignatureAuditLog(log: InsertSignatureAuditLog): Promise<SignatureAuditLog>;
  
  getSignatureAttempts(userId: number): Promise<any | undefined>;
  updateSignatureAttempts(userId: number, attempts: number, blockedUntil?: Date): Promise<void>;
  resetSignatureAttempts(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Usuários
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Clientes
  async getClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, clientUpdate: Partial<Client>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(clientUpdate)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Notas de Cliente
  async getClientNotes(clientId: number): Promise<ClientNote[]> {
    return db
      .select()
      .from(clientNotes)
      .where(eq(clientNotes.clientId, clientId))
      .orderBy(desc(clientNotes.createdAt));
  }

  async createClientNote(note: InsertClientNote): Promise<ClientNote> {
    const [newNote] = await db.insert(clientNotes).values(note).returning();
    return newNote;
  }

  async deleteClientNote(id: number): Promise<void> {
    await db.delete(clientNotes).where(eq(clientNotes.id, id));
  }

  // Chamados (Calls)
  async getCalls(): Promise<Call[]> {
    return db.select().from(calls).orderBy(desc(calls.displayOrder), desc(calls.createdAt));
  }

  async getCall(id: number): Promise<Call | undefined> {
    const [call] = await db.select().from(calls).where(eq(calls.id, id));
    return call;
  }

  async getCallsByClient(clientId: number): Promise<Call[]> {
    return db.select().from(calls).where(eq(calls.clientId, clientId)).orderBy(desc(calls.createdAt));
  }

  async createCall(call: InsertCall): Promise<Call> {
    // Explicitly fallback values to prevent database constraint violations 
    // even if Zod schema validates them as omitted/optional
    const payload = {
      ...call,
      serviceType: call.serviceType || "Geral",
      equipment: call.equipment || "Não informado",
      description: call.description || ""
    };
    
    const [newCall] = await db.insert(calls).values(payload).returning();
    
    // Registrar na timeline
    await this.createHistoryEvent({
      callId: newCall.id,
      eventType: 'call_created',
      description: 'Chamado criado no sistema',
      userId: newCall.userId || 1,
    });
    
    return newCall;
  }

  async updateCall(id: number, callUpdate: Partial<Call>): Promise<Call | undefined> {
    const [updatedCall] = await db
      .update(calls)
      .set({ ...callUpdate, updatedAt: new Date() })
      .where(eq(calls.id, id))
      .returning();
      
    if (updatedCall && callUpdate.status) {
      await this.createHistoryEvent({
        callId: updatedCall.id,
        eventType: 'status_changed',
        description: `Status alterado para: ${callUpdate.status}`,
        userId: updatedCall.userId || 1,
      });
    }
      
    return updatedCall;
  }

  async updateCallProgress(id: number, progress: number): Promise<Call | undefined> {
    const [updatedCall] = await db
      .update(calls)
      .set({ progress, updatedAt: new Date() })
      .where(eq(calls.id, id))
      .returning();
    return updatedCall;
  }

  async deleteCall(id: number): Promise<void> {
    // Delete associated history events first to avoid foreign key constraint violations
    await db.delete(historyEvents).where(eq(historyEvents.callId, id));
    
    // Update any services that might reference this call to remove the reference
    await db.update(services).set({ callId: null }).where(eq(services.callId, id));
    
    // Update any quotes that might reference this call
    await db.update(quotes).set({ callId: null }).where(eq(quotes.callId, id));
    
    // Update any financial transactions that might reference this call
    await db.update(financialTransactions).set({ callId: null }).where(eq(financialTransactions.callId, id));
    
    // Finally delete the call
    await db.delete(calls).where(eq(calls.id, id));
  }

  async getCompletedCallsCount(startDate: Date, endDate: Date): Promise<number> {
    const completedCalls = await db
      .select({ count: sql<number>`count(*)` })
      .from(calls)
      .where(
        and(
          eq(calls.status, 'concluido'),
          sql`${calls.updatedAt} >= ${startDate}`,
          sql`${calls.updatedAt} <= ${endDate}`
        )
      );
    return Number(completedCalls[0]?.count || 0);
  }

  async getTotalCompletedCalls(): Promise<number> {
    const completedCalls = await db
      .select({ count: sql<number>`count(*)` })
      .from(calls)
      .where(eq(calls.status, 'concluido'));
    return Number(completedCalls[0]?.count || 0);
  }

  async getOpenCallsCount(): Promise<number> {
    const openCalls = await db
      .select({ count: sql<number>`count(*)` })
      .from(calls)
      .where(or(eq(calls.status, 'aguardando'), eq(calls.status, 'em_andamento')));
    return Number(openCalls[0]?.count || 0);
  }

  // Orçamentos (Quotes)
  async getQuotes(): Promise<Quote[]> {
    return db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }

  async updateQuote(id: number, quoteUpdate: Partial<Quote>): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set(quoteUpdate)
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<void> {
    await db.delete(quotes).where(eq(quotes.id, id));
  }

  async getQuotesByDateRange(startDate: Date, endDate: Date): Promise<Quote[]> {
    return db
      .select()
      .from(quotes)
      .where(
        and(
          sql`${quotes.createdAt} >= ${startDate}`,
          sql`${quotes.createdAt} <= ${endDate}`
        )
      )
      .orderBy(desc(quotes.createdAt));
  }

  // Serviços (Services)
  async getServices(): Promise<Service[]> {
    return db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServicesByCallId(callId: number): Promise<Service[]> {
    return db.select().from(services).where(eq(services.callId, callId)).orderBy(desc(services.createdAt));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    
    // Registrar na timeline do chamado original (se existir) e do serviço
    if (newService.callId) {
      await this.createHistoryEvent({
        callId: newService.callId,
        serviceId: newService.id,
        eventType: 'converted_to_service',
        description: 'Chamado convertido em serviço',
        userId: newService.userId || 1,
      });
    }
    
    return newService;
  }

  async updateService(id: number, serviceUpdate: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
      
    if (updatedService) {
      await this.createHistoryEvent({
        serviceId: updatedService.id,
        callId: updatedService.callId || undefined,
        eventType: 'service_updated',
        description: 'Informações do serviço atualizadas',
        userId: updatedService.userId || 1,
      });
    }
      
    return updatedService;
  }

  async deleteService(id: number): Promise<void> {
    // Delete associated history events first to avoid foreign key constraints
    await db.delete(historyEvents).where(eq(historyEvents.serviceId, id));
    
    // Set serviceId to null on associated transactions before deleting
    await db.update(financialTransactions).set({ serviceId: null }).where(eq(financialTransactions.serviceId, id));
    
    await db.delete(services).where(eq(services.id, id));
  }

  // Histórico (History Events)
  async getHistoryEvents(): Promise<HistoryEvent[]> {
    return db.select().from(historyEvents).orderBy(desc(historyEvents.createdAt));
  }

  async getHistoryByCallId(callId: number): Promise<HistoryEvent[]> {
    return db.select().from(historyEvents).where(eq(historyEvents.callId, callId)).orderBy(desc(historyEvents.createdAt));
  }

  async getHistoryByServiceId(serviceId: number): Promise<HistoryEvent[]> {
    return db.select().from(historyEvents).where(eq(historyEvents.serviceId, serviceId)).orderBy(desc(historyEvents.createdAt));
  }

  async getHistoryByTransactionId(transactionId: number): Promise<HistoryEvent[]> {
    return db.select().from(historyEvents).where(eq(historyEvents.transactionId, transactionId)).orderBy(desc(historyEvents.createdAt));
  }

  async createHistoryEvent(event: InsertHistoryEvent): Promise<HistoryEvent> {
    const [newEvent] = await db.insert(historyEvents).values(event).returning();
    return newEvent;
  }

  // Financeiro
  async getFinancialTransactions(): Promise<FinancialTransaction[]> {
    return db.select().from(financialTransactions).orderBy(desc(financialTransactions.createdAt));
  }

  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    const [transaction] = await db.select().from(financialTransactions).where(eq(financialTransactions.id, id));
    return transaction;
  }

  async getFinancialTransactionsByDateRange(startDate: Date, endDate: Date): Promise<FinancialTransaction[]> {
    return db
      .select()
      .from(financialTransactions)
      .where(
        and(
          sql`${financialTransactions.createdAt} >= ${startDate}`,
          sql`${financialTransactions.createdAt} <= ${endDate}`
        )
      )
      .orderBy(desc(financialTransactions.createdAt));
  }

  async createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const [newTransaction] = await db.insert(financialTransactions).values(transaction).returning();
    
    // Registrar histórico
    if (newTransaction.callId || newTransaction.serviceId) {
      await this.createHistoryEvent({
        callId: newTransaction.callId || undefined,
        serviceId: newTransaction.serviceId || undefined,
        transactionId: newTransaction.id,
        eventType: 'converted_to_financial',
        description: `Lançamento financeiro criado: R$ ${newTransaction.amount}`,
        userId: newTransaction.userId || 1,
      });
    }
    
    return newTransaction;
  }

  async updateFinancialTransaction(id: number, transactionUpdate: Partial<FinancialTransaction>): Promise<FinancialTransaction | undefined> {
    const [updatedTransaction] = await db
      .update(financialTransactions)
      .set({ ...transactionUpdate, updatedAt: new Date() })
      .where(eq(financialTransactions.id, id))
      .returning();
      
    if (updatedTransaction && transactionUpdate.status === 'pago') {
      await this.createHistoryEvent({
        callId: updatedTransaction.callId || undefined,
        serviceId: updatedTransaction.serviceId || undefined,
        transactionId: updatedTransaction.id,
        eventType: 'payment_received',
        description: `Pagamento recebido: R$ ${updatedTransaction.amount}`,
        userId: updatedTransaction.userId || 1,
      });
    }
      
    return updatedTransaction;
  }

  async deleteFinancialTransaction(id: number): Promise<void> {
    // Delete associated history events first
    await db.delete(historyEvents).where(eq(historyEvents.transactionId, id));
    
    // Also delete any child transactions (installments)
    await db.delete(financialTransactions).where(eq(financialTransactions.parentTransactionId, id));
    
    await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
  }

  async getChildTransactions(parentId: number): Promise<FinancialTransaction[]> {
    return db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.parentTransactionId, parentId))
      .orderBy(financialTransactions.installmentNumber);
  }

  async createInstallments(transactionId: number, installmentsCount: number): Promise<FinancialTransaction[]> {
    const parent = await this.getFinancialTransaction(transactionId);
    if (!parent) throw new Error("Transaction not found");

    const installmentAmount = (Number(parent.amount) / installmentsCount).toFixed(2);
    const createdInstallments: FinancialTransaction[] = [];
    
    for (let i = 1; i <= installmentsCount; i++) {
      const dueDate = new Date(parent.dueDate || parent.createdAt);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      const installment: InsertFinancialTransaction = {
        ...parent,
        amount: installmentAmount,
        description: `${parent.description} (Parcela ${i}/${installmentsCount})`,
        dueDate,
        status: "pendente",
        parentTransactionId: parent.id,
        installmentNumber: i,
      };

      // @ts-ignore - Ignore the ID property when inserting
      delete installment.id;
      // @ts-ignore
      delete installment.createdAt;
      // @ts-ignore
      delete installment.updatedAt;

      const [newInstallment] = await db.insert(financialTransactions).values(installment as any).returning();
      createdInstallments.push(newInstallment);
    }

    // Atualiza a transação pai para status 'parcelado'
    await this.updateFinancialTransaction(parent.id, { status: 'parcelado' });

    return createdInstallments;
  }

  generatePixCode(amount: number): string {
    // Implementação mockada para o código PIX
    // Em um ambiente real, isso integraria com uma API de pagamento (Mercado Pago, Asaas, etc)
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136suporte@apoiotec.com.br520400005303986540${amount.toString().length}${amount.toFixed(2)}5802BR5913Apoiotec Info6009Sao Paulo62070503***630489AB`;
    return pixCode;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const totalClients = await db.select({ count: sql<number>`count(*)` }).from(clients);
    
    // Obtemos o mês atual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const financialStats = await db.select({
      totalEntradas: sql<number>`sum(case when type = 'entrada' and status = 'pago' then amount else 0 end)`,
      totalSaidas: sql<number>`sum(case when type = 'saida' and status = 'pago' then amount else 0 end)`,
      receitaMes: sql<number>`sum(case when type = 'entrada' and status = 'pago' and created_at >= ${firstDayOfMonth} then amount else 0 end)`
    }).from(financialTransactions);
    
    // Chama a função getOpenCallsCount já existente
    const openCallsCount = await this.getOpenCallsCount();

    return {
      totalClients: Number(totalClients[0]?.count || 0),
      openCalls: openCallsCount,
      revenue: Number(financialStats[0]?.totalEntradas || 0) - Number(financialStats[0]?.totalSaidas || 0),
      monthlyRevenue: Number(financialStats[0]?.receitaMes || 0),
    };
  }

  // Configurações
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const settings = await db.select().from(systemSettings).limit(1);
    
    if (settings.length === 0) {
      // Cria a configuração inicial se não existir
      const defaultSettings = {
        companyName: "Apoiotec Informática",
        fontSize: "26",
        pdfFontSize: "16",
        fontFamily: "system",
        theme: "light",
        primaryColor: "#2563eb",
        secondaryColor: "#00ff41",
        cardLayout: "double"
      };
      
      const [newSettings] = await db.insert(systemSettings).values(defaultSettings).returning();
      return newSettings;
    }
    
    return settings[0];
  }

  async updateSystemSettings(settingsUpdate: Partial<SystemSettings>): Promise<SystemSettings> {
    const currentSettings = await this.getSystemSettings();
    
    if (!currentSettings) {
      const [newSettings] = await db.insert(systemSettings).values(settingsUpdate as InsertSystemSettings).returning();
      return newSettings;
    }
    
    const [updatedSettings] = await db
      .update(systemSettings)
      .set({ ...settingsUpdate, updatedAt: new Date() })
      .where(eq(systemSettings.id, currentSettings.id))
      .returning();
      
    return updatedSettings;
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async updateTemplate(id: number, templateUpdate: Partial<Template>): Promise<Template | undefined> {
    const [updatedTemplate] = await db
      .update(templates)
      .set({ ...templateUpdate, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return updatedTemplate;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  // Base de Conhecimento
  async getKnowledgeBaseItems(): Promise<KnowledgeBase[]> {
    return db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.createdAt));
  }

  async getKnowledgeBaseItem(id: number): Promise<KnowledgeBase | undefined> {
    const [item] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return item;
  }

  async createKnowledgeBaseItem(item: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [newItem] = await db.insert(knowledgeBase).values(item).returning();
    return newItem;
  }

  async updateKnowledgeBaseItem(id: number, itemUpdate: Partial<KnowledgeBase>): Promise<KnowledgeBase | undefined> {
    const [updatedItem] = await db
      .update(knowledgeBase)
      .set({ ...itemUpdate, updatedAt: new Date() })
      .where(eq(knowledgeBase.id, id))
      .returning();
    return updatedItem;
  }

  async deleteKnowledgeBaseItem(id: number): Promise<void> {
    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
  }

  async incrementKnowledgeBaseViews(id: number): Promise<void> {
    await db.execute(sql`UPDATE ${knowledgeBase} SET views = views + 1 WHERE id = ${id}`);
  }

  async incrementKnowledgeBaseHelpful(id: number): Promise<void> {
    await db.execute(sql`UPDATE ${knowledgeBase} SET helpful = helpful + 1 WHERE id = ${id}`);
  }

  // Manutenção Preventiva
  async getPreventiveMaintenances(): Promise<(PreventiveMaintenance & { client: Client })[]> {
    const results = await db
      .select({
        maintenance: preventiveMaintenance,
        client: clients
      })
      .from(preventiveMaintenance)
      .innerJoin(clients, eq(preventiveMaintenance.clientId, clients.id))
      .orderBy(preventiveMaintenance.scheduledDate);
      
    return results.map(row => ({
      ...row.maintenance,
      client: row.client
    }));
  }

  async getPreventiveMaintenance(id: number): Promise<PreventiveMaintenance | undefined> {
    const [item] = await db.select().from(preventiveMaintenance).where(eq(preventiveMaintenance.id, id));
    return item;
  }

  async getPreventiveMaintenancesByClient(clientId: number): Promise<PreventiveMaintenance[]> {
    return db
      .select()
      .from(preventiveMaintenance)
      .where(eq(preventiveMaintenance.clientId, clientId))
      .orderBy(preventiveMaintenance.scheduledDate);
  }

  async createPreventiveMaintenance(maintenance: InsertPreventiveMaintenance): Promise<PreventiveMaintenance> {
    const [newItem] = await db.insert(preventiveMaintenance).values(maintenance).returning();
    return newItem;
  }

  async updatePreventiveMaintenance(id: number, update: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance | undefined> {
    const [updatedItem] = await db
      .update(preventiveMaintenance)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(preventiveMaintenance.id, id))
      .returning();
    return updatedItem;
  }

  async deletePreventiveMaintenance(id: number): Promise<void> {
    await db.delete(preventiveMaintenance).where(eq(preventiveMaintenance.id, id));
  }

  // Telegram e Notificações
  async getTelegramConfig(userId: number): Promise<TelegramConfig | undefined> {
    const [config] = await db.select().from(telegramConfig).where(eq(telegramConfig.userId, userId));
    return config;
  }

  async updateTelegramConfig(userId: number, configUpdate: Partial<TelegramConfig>): Promise<TelegramConfig> {
    const [updated] = await db
      .update(telegramConfig)
      .set({ ...configUpdate, updatedAt: new Date() })
      .where(eq(telegramConfig.userId, userId))
      .returning();
    return updated;
  }

  async createTelegramConfig(config: InsertTelegramConfig): Promise<TelegramConfig> {
    const [newConfig] = await db.insert(telegramConfig).values(config).returning();
    return newConfig;
  }

  async getNotificationPreferences(userId: number): Promise<NotificationPreferences[]> {
    return db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  }

  async updateNotificationPreference(userId: number, type: string, enabled: boolean): Promise<NotificationPreferences> {
    // Primeiro tenta atualizar
    const [updated] = await db
      .update(notificationPreferences)
      .set({ enabled, updatedAt: new Date() })
      .where(and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.notificationType, type)
      ))
      .returning();

    // Se não existir, cria
    if (!updated) {
      const [created] = await db.insert(notificationPreferences).values({
        userId,
        notificationType: type,
        enabled
      }).returning();
      return created;
    }

    return updated;
  }

  // Mensagens
  async getMessages(): Promise<Message[]> {
    return db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async deleteMessage(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }
  
  // Links de Download
  async getDownloadLinks(): Promise<DownloadLink[]> {
    return db.select().from(downloadLinks).orderBy(desc(downloadLinks.createdAt));
  }

  async createDownloadLink(link: InsertDownloadLink): Promise<DownloadLink> {
    const [newLink] = await db.insert(downloadLinks).values(link).returning();
    return newLink;
  }

  async deleteDownloadLink(id: number): Promise<void> {
    await db.delete(downloadLinks).where(eq(downloadLinks.id, id));
  }

  // Sistema de Ativação
  async getActivationConfig(): Promise<SystemActivation | undefined> {
    const [config] = await db.select().from(systemActivation).limit(1);
    return config;
  }

  async updateActivationConfig(configUpdate: Partial<SystemActivation>): Promise<SystemActivation> {
    const currentConfig = await this.getActivationConfig();
    
    if (!currentConfig) {
      throw new Error("Sistema não está ativado");
    }
    
    const [updated] = await db
      .update(systemActivation)
      .set(configUpdate)
      .where(eq(systemActivation.id, currentConfig.id))
      .returning();
      
    return updated;
  }

  async createActivationConfig(config: InsertSystemActivation): Promise<SystemActivation> {
    const [newConfig] = await db.insert(systemActivation).values(config).returning();
    return newConfig;
  }

  // Backups
  async getBackupHistory(): Promise<BackupHistory[]> {
    return db.select().from(backupHistory).orderBy(desc(backupHistory.createdAt));
  }

  async createBackupHistory(backup: InsertBackupHistory): Promise<BackupHistory> {
    const [newBackup] = await db.insert(backupHistory).values(backup).returning();
    return newBackup;
  }

  async updateBackupHistory(id: number, backupUpdate: Partial<BackupHistory>): Promise<BackupHistory | undefined> {
    const [updatedBackup] = await db
      .update(backupHistory)
      .set(backupUpdate)
      .where(eq(backupHistory.id, id))
      .returning();
    return updatedBackup;
  }
  
  async getBackupSchedules(): Promise<BackupSchedule[]> {
    return db.select().from(backupSchedules).orderBy(desc(backupSchedules.createdAt));
  }
  
  async getBackupSchedule(id: number): Promise<BackupSchedule | undefined> {
    const [schedule] = await db.select().from(backupSchedules).where(eq(backupSchedules.id, id));
    return schedule;
  }
  
  async getActiveBackupSchedules(): Promise<BackupSchedule[]> {
    return db.select().from(backupSchedules).where(eq(backupSchedules.isActive, true));
  }
  
  async createBackupSchedule(schedule: InsertBackupSchedule): Promise<BackupSchedule> {
    const [newSchedule] = await db.insert(backupSchedules).values(schedule).returning();
    return newSchedule;
  }
  
  async updateBackupSchedule(id: number, scheduleUpdate: Partial<BackupSchedule>): Promise<BackupSchedule | undefined> {
    const [updatedSchedule] = await db
      .update(backupSchedules)
      .set({ ...scheduleUpdate, updatedAt: new Date() })
      .where(eq(backupSchedules.id, id))
      .returning();
    return updatedSchedule;
  }
  
  async deleteBackupSchedule(id: number): Promise<void> {
    await db.delete(backupSchedules).where(eq(backupSchedules.id, id));
  }
  
  async getBackupExecutionLogs(scheduleId?: number): Promise<BackupExecutionLog[]> {
    if (scheduleId) {
      return db.select().from(backupExecutionLogs)
        .where(eq(backupExecutionLogs.scheduleId, scheduleId))
        .orderBy(desc(backupExecutionLogs.createdAt));
    }
    return db.select().from(backupExecutionLogs).orderBy(desc(backupExecutionLogs.createdAt));
  }
  
  async createBackupExecutionLog(log: InsertBackupExecutionLog): Promise<BackupExecutionLog> {
    const [newLog] = await db.insert(backupExecutionLogs).values(log).returning();
    return newLog;
  }
  
  async updateBackupExecutionLog(id: number, logUpdate: Partial<BackupExecutionLog>): Promise<BackupExecutionLog | undefined> {
    const [updatedLog] = await db
      .update(backupExecutionLogs)
      .set(logUpdate)
      .where(eq(backupExecutionLogs.id, id))
      .returning();
    return updatedLog;
  }

  // Estoque - Produtos
  async getInventoryProducts(): Promise<InventoryProduct[]> {
    return db.select().from(inventoryProducts).orderBy(desc(inventoryProducts.createdAt));
  }

  async getInventoryProduct(id: number): Promise<InventoryProduct | undefined> {
    const [product] = await db.select().from(inventoryProducts).where(eq(inventoryProducts.id, id));
    return product;
  }

  async createInventoryProduct(product: InsertInventoryProduct): Promise<InventoryProduct> {
    const [newProduct] = await db.insert(inventoryProducts).values(product).returning();
    return newProduct;
  }

  async updateInventoryProduct(id: number, productUpdate: Partial<InventoryProduct>): Promise<InventoryProduct | undefined> {
    const [updatedProduct] = await db
      .update(inventoryProducts)
      .set({ ...productUpdate, updatedAt: new Date() })
      .where(eq(inventoryProducts.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteInventoryProduct(id: number): Promise<void> {
    await db.delete(inventoryProducts).where(eq(inventoryProducts.id, id));
  }

  // Estoque - Serviços
  async getInventoryServices(): Promise<InventoryService[]> {
    return db.select().from(inventoryServices).orderBy(desc(inventoryServices.createdAt));
  }

  async getInventoryService(id: number): Promise<InventoryService | undefined> {
    const [service] = await db.select().from(inventoryServices).where(eq(inventoryServices.id, id));
    return service;
  }

  async createInventoryService(service: InsertInventoryService): Promise<InventoryService> {
    const [newService] = await db.insert(inventoryServices).values(service).returning();
    return newService;
  }

  async updateInventoryService(id: number, serviceUpdate: Partial<InventoryService>): Promise<InventoryService | undefined> {
    const [updatedService] = await db
      .update(inventoryServices)
      .set({ ...serviceUpdate, updatedAt: new Date() })
      .where(eq(inventoryServices.id, id))
      .returning();
    return updatedService;
  }

  async deleteInventoryService(id: number): Promise<void> {
    await db.delete(inventoryServices).where(eq(inventoryServices.id, id));
  }

  // Estoque - Movimentações
  async getInventoryMovements(productId: number): Promise<InventoryMovement[]> {
    return db.select()
      .from(inventoryMovements)
      .where(eq(inventoryMovements.productId, productId))
      .orderBy(desc(inventoryMovements.createdAt));
  }

  async createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [newMovement] = await db.insert(inventoryMovements).values(movement).returning();
    return newMovement;
  }

  // Certificados e Assinatura Digital
  async getDigitalCertificates(): Promise<DigitalCertificate[]> {
    return db.select().from(digitalCertificates).orderBy(desc(digitalCertificates.createdAt));
  }

  async getDigitalCertificate(id: number): Promise<DigitalCertificate | undefined> {
    const [certificate] = await db.select().from(digitalCertificates).where(eq(digitalCertificates.id, id));
    return certificate;
  }

  async createDigitalCertificate(certificate: InsertDigitalCertificate): Promise<DigitalCertificate> {
    const [newCertificate] = await db.insert(digitalCertificates).values(certificate).returning();
    return newCertificate;
  }

  async updateDigitalCertificate(id: number, certificateUpdate: Partial<DigitalCertificate>): Promise<DigitalCertificate | undefined> {
    const [updatedCertificate] = await db
      .update(digitalCertificates)
      .set({ ...certificateUpdate, updatedAt: new Date() })
      .where(eq(digitalCertificates.id, id))
      .returning();
    return updatedCertificate;
  }

  async deleteDigitalCertificate(id: number): Promise<void> {
    await db.delete(digitalCertificates).where(eq(digitalCertificates.id, id));
  }
  
  async getSignatureAuditLogs(): Promise<SignatureAuditLog[]> {
    return db.select().from(signatureAuditLog).orderBy(desc(signatureAuditLog.createdAt));
  }
  
  async createSignatureAuditLog(log: InsertSignatureAuditLog): Promise<SignatureAuditLog> {
    const [newLog] = await db.insert(signatureAuditLog).values(log).returning();
    return newLog;
  }

  async getSignatureAttempts(userId: number): Promise<any | undefined> {
    const [attempts] = await db.select().from(signatureAttempts).where(eq(signatureAttempts.userId, userId));
    return attempts;
  }
  
  async updateSignatureAttempts(userId: number, attemptCount: number, blockedUntil?: Date): Promise<void> {
    const existing = await this.getSignatureAttempts(userId);
    
    if (existing) {
      await db.update(signatureAttempts)
        .set({ 
          attemptCount, 
          blockedUntil: blockedUntil || null,
          lastAttempt: new Date() 
        })
        .where(eq(signatureAttempts.userId, userId));
    } else {
      await db.insert(signatureAttempts)
        .values({ 
          userId, 
          attemptCount, 
          blockedUntil: blockedUntil || null,
          lastAttempt: new Date() 
        });
    }
  }
  
  async resetSignatureAttempts(userId: number): Promise<void> {
    await db.update(signatureAttempts)
      .set({ attemptCount: 0, blockedUntil: null })
      .where(eq(signatureAttempts.userId, userId));
  }
}

export const storage = new DatabaseStorage();