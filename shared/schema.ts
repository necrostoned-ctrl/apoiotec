import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  cpf: text("cpf"),
  documentType: text("document_type").default("cpf"), // "cpf" or "cnpj"
  address: text("address"),
  city: text("city"),
  state: text("state"),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientNotes = pgTable("client_notes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ClientNote = typeof clientNotes.$inferSelect;
export type InsertClientNote = typeof clientNotes.$inferInsert;
export const insertClientNoteSchema = createInsertSchema(clientNotes).omit({ id: true, createdAt: true, updatedAt: true });

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }), // Campo mantido para compatibilidade com banco existente, não usado no formulário
  estimatedTime: text("estimated_time"),
  category: text("category"),
  priority: text("priority").notNull().default("media"),
  clientId: integer("client_id"),
  callId: integer("call_id"), // ID do chamado original quando convertido
  userId: integer("user_id").default(1), // Usuário criador
  createdByUserId: integer("created_by_user_id").default(1), // Usuário que criou
  products: text("products"), // Lista de produtos/materiais em JSON
  callDate: timestamp("call_date"), // Data do chamado original (copiada)
  serviceDate: timestamp("service_date"), // Data do serviço editável
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"), // Permitir NULL para chamados sem cliente específico
  userId: integer("user_id").default(1), // Usuário criador
  createdByUserId: integer("created_by_user_id").default(1), // Usuário que criou
  equipment: text("equipment").notNull().default("Não informado"),
  serviceType: text("service_type").notNull().default("Geral"), // Mantido por retrocompatibilidade
  priority: text("priority").notNull().default("media"),
  description: text("description").notNull().default(""),
  internalNotes: text("internal_notes"),
  status: text("status").notNull().default("aguardando"),
  progress: integer("progress").default(0),
  callDate: timestamp("call_date"), // Data editável do chamado
  displayOrder: integer("display_order").default(0), // Ordem personalizada de exibição
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  callId: integer("call_id"), // Permitir null para orçamentos independentes
  clientId: integer("client_id").notNull(),
  items: text("items").notNull(), // JSON string of quote items
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pendente"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  resolution: text("resolution"),
  clientId: integer("client_id"),
  callId: integer("call_id"),
  serviceId: integer("service_id"), // Referência ao serviço original
  userId: integer("user_id").notNull().default(1), // Campo para associar ao usuário
  createdByUserId: integer("created_by_user_id").default(1), // Usuário que criou
  completedByUserId: integer("completed_by_user_id"), // Usuário que concluiu
  type: text("type").notNull(), // "entrada" or "saida"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }), // Valor original antes do desconto
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"), // Valor do desconto aplicado
  serviceAmount: decimal("service_amount", { precision: 10, scale: 2 }), // Valor específico de serviços
  productAmount: decimal("product_amount", { precision: 10, scale: 2 }), // Valor específico de produtos
  serviceDetails: text("service_details"), // JSON com detalhes dos serviços
  productDetails: text("product_details"), // JSON com detalhes dos produtos
  status: text("status").notNull().default("pendente"), // 'pendente', 'pago', 'cancelado', 'parcial', 'parcelado'
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  completedAt: timestamp("completed_at"), // Data de conclusão
  callDate: timestamp("call_date"), // Data do chamado original
  serviceDate: timestamp("service_date"), // Data do serviço original
  billingDate: timestamp("billing_date").defaultNow().notNull(), // Data de faturamento
  parentTransactionId: integer("parent_transaction_id"),
  installmentNumber: integer("installment_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({ id: true, createdAt: true, updatedAt: true });

export type FinancialTransactionWithClient = FinancialTransaction & {
  client?: Client | null;
  call?: any | null;
  user?: any | null;
  childTransactions?: FinancialTransaction[];
};

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("outros"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

export const downloadLinks = pgTable("download_links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull().default("system"), // "system" or "useful"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DownloadLink = typeof downloadLinks.$inferSelect;
export type InsertDownloadLink = typeof downloadLinks.$inferInsert;
export const insertDownloadLinkSchema = createInsertSchema(downloadLinks).omit({ id: true, createdAt: true });

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  cnpj: text("cnpj"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  fontSize: text("font_size").default("16"),
  pdfFontSize: text("pdf_font_size").default("12"),
  fontFamily: text("font_family").default("Arial"),
  theme: text("theme").notNull().default("light"),
  primaryColor: text("primary_color").notNull().default("#2563eb"),
  secondaryColor: text("secondary_color").notNull().default("#00ff41"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true, updatedAt: true });

export const historyEvents = pgTable("history_events", {
  id: serial("id").primaryKey(),
  callId: integer("call_id"),
  serviceId: integer("service_id"),
  transactionId: integer("transaction_id"),
  eventType: text("event_type").notNull(),
  description: text("description"),
  userId: integer("user_id").default(1),
  metadata: text("metadata"), // JSON para dados adicionais
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HistoryEvent = typeof historyEvents.$inferSelect;
export type InsertHistoryEvent = z.infer<typeof insertHistoryEventSchema>;
export const insertHistoryEventSchema = createInsertSchema(historyEvents).omit({ id: true, createdAt: true });

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });

export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export const insertCallSchema = createInsertSchema(calls).omit({ id: true, createdAt: true, updatedAt: true });

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true });

export type CallWithClient = Call & {
  client?: Client;
  user?: User;
};

export type QuoteWithClient = Quote & {
  client?: Client;
};

export type ServiceWithClient = Service & {
  client?: Client;
};

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("Apoiotec Informática"),
  cnpj: text("cnpj"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  pdfSubtitle: text("pdf_subtitle").default("Assessoria e Assistência Técnica em Informática"),
  pdfPhone1: text("pdf_phone1"),
  pdfPhone2: text("pdf_phone2"),
  fontSize: text("font_size").notNull().default("26"),
  pdfFontSize: text("pdf_font_size").notNull().default("16"),
  fontFamily: text("font_family").notNull().default("system"),
  theme: text("theme").notNull().default("light"),
  primaryColor: text("primary_color").notNull().default("#2563eb"),
  secondaryColor: text("secondary_color").notNull().default("#00ff41"),
  cardLayout: text("card_layout").notNull().default("double"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;

export const telegramConfig = pgTable("telegram_config", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  botToken: text("bot_token").notNull(),
  chatId: text("chat_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTelegramConfigSchema = createInsertSchema(telegramConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTelegramConfig = z.infer<typeof insertTelegramConfigSchema>;
export type TelegramConfig = typeof telegramConfig.$inferSelect;

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  notificationType: text("notification_type").notNull(),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// NOVA: Knowledge Base (Base de Conhecimento)
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  keywords: text("keywords"),
  tags: text("tags"),
  views: integer("views").default(0),
  helpful: integer("helpful").default(0),
  userId: integer("user_id").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NOVA: Preventive Maintenance (Manutenção Preventiva)
export const preventiveMaintenance = pgTable("preventive_maintenance", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  equipmentType: text("equipment_type"),
  frequency: text("frequency").notNull(), // semanal, mensal, trimestral, anual
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull().default("pendente"),
  notes: text("notes"),
  userId: integer("user_id").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types for Knowledge Base - MUST be after table definition
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ id: true, views: true, helpful: true, createdAt: true, updatedAt: true });

// Types for Preventive Maintenance - MUST be after table definition
export type PreventiveMaintenance = typeof preventiveMaintenance.$inferSelect;
export type InsertPreventiveMaintenance = z.infer<typeof insertPreventiveMaintenanceSchema>;
export const insertPreventiveMaintenanceSchema = createInsertSchema(preventiveMaintenance).omit({ id: true, createdAt: true, updatedAt: true });

export type PreventiveMaintenanceWithClient = PreventiveMaintenance & {
  client?: Client;
};

// ============================================================================
// SISTEMA DE ATIVAÇÃO
// ============================================================================
export const systemActivation = pgTable("system_activation", {
  id: serial("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  hardwareFingerprint: text("hardware_fingerprint").notNull().unique(),
  failedAttempts: integer("failed_attempts").default(0),
  blockedUntil: timestamp("blocked_until"),
  activatedAt: timestamp("activated_at").defaultNow().notNull(),
  lastAttempt: timestamp("last_attempt"),
});

export type SystemActivation = typeof systemActivation.$inferSelect;
export type InsertSystemActivation = typeof systemActivation.$inferInsert;

// ============================================================================
// SISTEMA DE BACKUPS
// ============================================================================
export const backupHistory = pgTable("backup_history", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size"), // em bytes
  status: text("status").default("sucesso"), // sucesso, erro
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"),
  wasScheduled: boolean("was_scheduled").default(false),
  sentToTelegram: boolean("sent_to_telegram").default(false),
  telegramMessageId: text("telegram_message_id"),
});

export type BackupHistory = typeof backupHistory.$inferSelect;
export type InsertBackupHistory = typeof backupHistory.$inferInsert;

// ============================================================================
// AGENDAMENTO DE BACKUPS
// ============================================================================
export const backupSchedules = pgTable("backup_schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  frequency: text("frequency").notNull(), // "diario" | "semanal" | "mensal"
  scheduledTime: text("scheduled_time").notNull(), // "HH:MM" em UTC -3
  timezone: text("timezone").default("-3"),
  sendToTelegram: boolean("send_to_telegram").default(true),
  isActive: boolean("is_active").default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  nextExecutionAt: timestamp("next_execution_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BackupSchedule = typeof backupSchedules.$inferSelect;
export type InsertBackupSchedule = z.infer<typeof insertBackupScheduleSchema>;
export const insertBackupScheduleSchema = createInsertSchema(backupSchedules).omit({ id: true, createdAt: true, updatedAt: true });

export const backupExecutionLogs = pgTable("backup_execution_logs", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull(),
  status: text("status").notNull(), // "agendado" | "executando" | "sucesso" | "erro" | "atrasado"
  scheduledTime: timestamp("scheduled_time").notNull(),
  executedAt: timestamp("executed_at"),
  fileSize: integer("file_size"),
  sentToTelegram: boolean("sent_to_telegram").default(false),
  telegramMessageId: text("telegram_message_id"),
  errorMessage: text("error_message"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BackupExecutionLog = typeof backupExecutionLogs.$inferSelect;
export type InsertBackupExecutionLog = z.infer<typeof insertBackupExecutionLogSchema>;
export const insertBackupExecutionLogSchema = createInsertSchema(backupExecutionLogs).omit({ id: true, createdAt: true });

// ============================================================================
// ESTOQUE - PRODUTOS E SERVIÇOS
// ============================================================================
export const inventoryProducts = pgTable("inventory_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  minAlert: integer("min_alert").notNull().default(2),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InventoryProduct = typeof inventoryProducts.$inferSelect;
export type InsertInventoryProduct = z.infer<typeof insertInventoryProductSchema>;
export const insertInventoryProductSchema = createInsertSchema(inventoryProducts)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    price: z.coerce.number().positive("Preço deve ser maior que 0"),
    quantity: z.coerce.number().int("Quantidade deve ser um número inteiro").nonnegative("Quantidade não pode ser negativa"),
    minAlert: z.coerce.number().int("Nível crítico deve ser um número inteiro").nonnegative("Nível crítico não pode ser negativo"),
  });

export const inventoryServices = pgTable("inventory_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category"),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InventoryService = typeof inventoryServices.$inferSelect;
export type InsertInventoryService = z.infer<typeof insertInventoryServiceSchema>;
export const insertInventoryServiceSchema = createInsertSchema(inventoryServices)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    price: z.coerce.number().positive("Preço deve ser maior que 0"),
  });

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  type: text("type").notNull(), // "entrada" | "saida"
  quantity: integer("quantity").notNull(),
  reference: text("reference"), // Ex: "service_123"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({ id: true, createdAt: true });

// ============================================================================
// CERTIFICADOS DIGITAIS E ASSINATURA
// ============================================================================
export const digitalCertificates = pgTable("digital_certificates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Nome amigável do certificado
  subjectName: text("subject_name"), // Nome do titular (CN)
  issuerName: text("issuer_name"), // Autoridade certificadora
  serialNumber: text("serial_number"), // Número serial
  cnpj: text("cnpj"), // CNPJ extraído do certificado
  certificatePath: text("certificate_path").notNull(), // Caminho do arquivo .pfx
  expiryDate: timestamp("expiry_date").notNull(), // Data de expiração
  status: text("status").notNull().default("active"), // 'active', 'expired', 'warning'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DigitalCertificate = typeof digitalCertificates.$inferSelect;
export type InsertDigitalCertificate = z.infer<typeof insertDigitalCertificateSchema>;
export const insertDigitalCertificateSchema = createInsertSchema(digitalCertificates).omit({ id: true, createdAt: true, updatedAt: true });

export const signatureAuditLog = pgTable("signature_audit_log", {
  id: serial("id").primaryKey(),
  certificateId: integer("certificate_id").notNull(),
  documentType: text("document_type").notNull(), // 'quotation', 'service_note', 'receipt'
  documentId: integer("document_id").notNull(),
  userId: integer("user_id").notNull(),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  status: text("status").notNull().default("success"), // 'success', 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SignatureAuditLog = typeof signatureAuditLog.$inferSelect;
export type InsertSignatureAuditLog = z.infer<typeof insertSignatureAuditLogSchema>;
export const insertSignatureAuditLogSchema = createInsertSchema(signatureAuditLog).omit({ id: true, createdAt: true });

// Tabela para controle de tentativas de senha (rate limiting)
export const signatureAttempts = pgTable("signature_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  lastAttempt: timestamp("last_attempt").defaultNow().notNull(),
  blockedUntil: timestamp("blocked_until"),
});