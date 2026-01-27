import { storage } from "../storage";
import FormData from "form-data";
import https from "https";
import {
  validateNotificationPayload,
  ensureCorrectUserId,
  logNotificationAudit,
  detectUserSwitches,
  correctUserIdForNotification,
  type NotificationPayload,
} from "./notificationValidator";

// Função auxiliar para formatar datas com timezone Brasil (-3)
function formatDateBrazil(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  // Ajustar para timezone -3 (Brasil) - subtrair 3 horas
  const offset = -3 * 60 * 60 * 1000; // -3 horas em ms
  const brasilDate = new Date(d.getTime() + offset);
  return brasilDate.toLocaleDateString("pt-BR");
}

function formatTimeBrazil(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  // Ajustar para timezone -3 (Brasil) - subtrair 3 horas
  const offset = -3 * 60 * 60 * 1000; // -3 horas em ms
  const brasilDate = new Date(d.getTime() + offset);
  return brasilDate.toLocaleTimeString("pt-BR");
}

// Tipos de notificação disponíveis
export const notificationTypes = {
  CALL_CREATED: 'call_created',
  CALL_UPDATED: 'call_updated',
  CALL_DELETED: 'call_deleted',
  SERVICE_CREATED: 'service_created',
  SERVICE_UPDATED: 'service_updated',
  SERVICE_DELETED: 'service_deleted',
  CALL_TO_SERVICE: 'call_to_service',
  SERVICE_TO_FINANCIAL: 'service_to_financial',
  FINANCIAL_CREATED: 'financial_created',
  FINANCIAL_UPDATED: 'financial_updated',
  FINANCIAL_DELETED: 'financial_deleted',
  FINANCIAL_TO_SERVICE: 'financial_to_service',
  PAYMENT_RECEIVED: 'payment_received',
  FINANCIAL_DISCOUNT: 'financial_discount',
  FINANCIAL_INSTALLMENT: 'financial_installment',
  FINANCIAL_PAYMENT: 'financial_payment',
  FINANCIAL_PDF: 'financial_pdf',
  QUOTE_CREATED: 'quote_created',
  QUOTE_UPDATED: 'quote_updated',
  QUOTE_GENERATED: 'quote_generated',
  CLIENT_CREATED: 'client_created',
  CLIENT_UPDATED: 'client_updated',
  CLIENT_DELETED: 'client_deleted',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
};

/**
 * NOVO PADRÃO: FILTRO PRIMEIRO, DEPOIS MENSAGEM, DEPOIS ENVIO
 * 1. Corrige o userId com o filtro rigoroso
 * 2. Busca o nome CORRETO do usuário corrigido
 * 3. DEPOIS formata a mensagem com o nome correto
 * 4. ENTÃO envia ao Telegram
 */
export async function sendTelegramNotification(
  message: string,
  notificationType?: string,
  validatedUserId?: number,
  validatedUserName?: string,
  fallbackUserId?: number
) {
  try {
    // 🔥 PASSO 1: FILTRO RIGOROSO PRIMEIRO - Corrige o userId ANTES de qualquer outra coisa
    let finalUserId = validatedUserId;
    let finalUserName = validatedUserName;

    if (validatedUserId !== undefined || fallbackUserId !== undefined) {
      try {
        const corrected = await correctUserIdForNotification(validatedUserId, fallbackUserId);
        finalUserId = corrected.userId;
        finalUserName = corrected.userName;
        
        console.log(`✅ [FILTRO] UserId: ${validatedUserId} → Corrigido para: ${finalUserId} (${finalUserName})`);
      } catch (correctionError) {
        console.error(`❌ [FILTRO] Erro ao corrigir userId:`, correctionError);
        finalUserId = validatedUserId;
        finalUserName = validatedUserName;
      }
    }

    // 🔥 PASSO 2: REFORMATAR MENSAGEM com o nome CORRETO após filtro
    let finalMessage = message;
    if (finalUserName) {
      // Se a mensagem não tem o nome final ainda, substituir placeholder genérico "Por: "
      // ou qualquer nome antigo por "Por: {finalUserName}"
      finalMessage = message.replace(/Por: [^\n]*/g, `Por: ${finalUserName}`);
      console.log(`✅ [FORMATAÇÃO] Mensagem reformatada com nome correto final: "${finalUserName}"`);
    }

    // Log de auditoria para rastrear qualquer problema
    if (finalUserId && finalUserName) {
      logNotificationAudit(finalUserId, finalUserName, "send", "telegram");
      detectUserSwitches(finalUserId, finalUserName);
    }

    const configs = await storage.getAllTelegramConfigs();
    
    if (!configs || configs.length === 0) {
      console.log("Nenhuma configuração Telegram encontrada");
      return false;
    }

    // 🔥 PASSO 3: ENVIAR com mensagem CORRIGIDA
    let sent = false;
    for (const config of configs) {
      if (!config.isActive) continue;

      // Verificar preferência se notificationType for fornecido
      if (notificationType) {
        const isEnabled = await storage.isNotificationEnabled(config.userId, notificationType);
        if (!isEnabled) {
          console.log(`Notificação ${notificationType} desabilitada para usuário ${config.userId}`);
          continue;
        }
      }

      try {
        const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: config.chatId,
            text: finalMessage,
            parse_mode: "HTML",
          }),
        });

        if (response.ok) {
          console.log(`✅ [ENVIADO] Notificação ao Telegram - Usuário ID: ${config.userId} | Responsável: ${finalUserName}`);
          sent = true;
        } else {
          console.error("Erro ao enviar Telegram:", await response.text());
        }
      } catch (error) {
        console.error("Erro ao enviar para usuário ID", config.userId, error);
      }
    }
    
    return sent;
  } catch (error) {
    console.error("Erro ao enviar notificações Telegram:", error);
    return false;
  }
}

export function formatCallNotification(call: any, userName: string = "Sistema") {
  return `🎯 <b>Novo Chamado Criado</b>
━━━━━━━━━━━━━━━━
📞 ID: #${call.id}
👤 Cliente: ${call.client?.name || "Sem cliente"}
🖥️  Equipamento: ${call.equipment}
🔧 Tipo: ${call.serviceType}
⚡ Prioridade: <b>${call.priority.toUpperCase()}</b>
📄 Descrição: ${call.description}
📅 Data: ${formatDateBrazil(call.createdAt)}
━━━━━━━━━━━━━━━━`;
}

export function formatCallToServiceNotification(call: any, service: any, userName: string = "Sistema") {
  return `✅ <b>Chamado → Serviço</b>
━━━━━━━━━━━━━━━━
📞 Chamado #${call.id} ➜ 🛠️  Serviço #${service.id}
👤 Cliente: ${call.client?.name || "Sem cliente"}
📋 Nome: <b>${service.name}</b>
💵 Valor: <b>R$ ${service.basePrice || '0,00'}</b>
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatServiceToFinancialNotification(service: any, transaction: any, userName: string = "Sistema") {
  const isEntrada = transaction.type === "entrada";
  return `💳 <b>Serviço → Financeiro</b>
━━━━━━━━━━━━━━━━
🛠️  Serviço #${service.id} ➜ 💰 Transação #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${transaction.amount}</b>
📊 Tipo: ${isEntrada ? '📥 ENTRADA' : '📤 SAÍDA'}
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialUpdateNotification(transaction: any, userName: string = "Sistema") {
  return `📝 <b>Transação Atualizada</b>
━━━━━━━━━━━━━━━━
💰 ID: #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${transaction.amount}</b>
🔄 Status: <b>${transaction.status.toUpperCase()}</b>
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialPaidNotification(transaction: any, userName: string = "Sistema") {
  return `💚 ✅ <b>Pagamento Recebido</b>
━━━━━━━━━━━━━━━━
💰 Transação #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${transaction.amount}</b>
✨ Status: <b>PAGO</b>
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialToServiceNotification(transaction: any, userName: string = "Sistema") {
  const isEntrada = transaction.type === "entrada";
  return `↩️ <b>Financeiro → Serviço</b>
━━━━━━━━━━━━━━━━
💰 Transação #${transaction.id} ➜ 🛠️  Serviço
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${transaction.amount}</b>
📊 Tipo: ${isEntrada ? '📥 ENTRADA' : '📤 SAÍDA'}
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatClientCreatedNotification(client: any, userName: string = "Sistema") {
  return `🎉 <b>Novo Cliente Criado</b>
━━━━━━━━━━━━━━━━
👤 Nome: <b>${client.name}</b>
📞 Telefone: ${client.phone || "N/A"}
✉️ Email: ${client.email || "N/A"}
📍 Endereço: ${client.address || "N/A"}
🟢 Status: <b>${client.status.toUpperCase()}</b>
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatClientUpdatedNotification(client: any, userName: string = "Sistema") {
  return `✏️ <b>Cliente Atualizado</b>
━━━━━━━━━━━━━━━━
👤 Nome: <b>${client.name}</b>
📞 Telefone: ${client.phone || "N/A"}
✉️ Email: ${client.email || "N/A"}
📍 Endereço: ${client.address || "N/A"}
🔄 Status: <b>${client.status.toUpperCase()}</b>
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatServiceCreatedNotification(service: any, userName: string = "Sistema") {
  return `🆕 <b>Novo Serviço Criado</b>
━━━━━━━━━━━━━━━━
🛠️ Serviço #${service.id}
👤 Cliente: ${service.client?.name || "Sem cliente"}
📋 Nome: <b>${service.name}</b>
💵 Valor: <b>R$ ${service.basePrice || '0,00'}</b>
🏷️ Categoria: ${service.category || "N/A"}
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatServiceUpdatedNotification(service: any, userName: string = "Sistema") {
  return `✏️ <b>Serviço Atualizado</b>
━━━━━━━━━━━━━━━━
🛠️ Serviço #${service.id}
👤 Cliente: ${service.client?.name || "Sem cliente"}
📋 Nome: <b>${service.name}</b>
💵 Valor: <b>R$ ${service.basePrice || '0,00'}</b>
🏷️ Categoria: ${service.category || "N/A"}
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatCallCreatedNotification(call: any, userName: string = "Sistema") {
  return `📞 <b>Novo Chamado Criado</b>
━━━━━━━━━━━━━━━━
📞 Chamado #${call.id}
👤 Cliente: ${call.client?.name || "Sem cliente"}
🖥️ Equipamento: ${call.equipment}
⚡ Prioridade: <b>${call.priority.toUpperCase()}</b>
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatCallUpdatedNotification(call: any, userName: string = "Sistema") {
  return `✏️ <b>Chamado Atualizado</b>
━━━━━━━━━━━━━━━━
📞 Chamado #${call.id}
👤 Cliente: ${call.client?.name || "Sem cliente"}
🖥️ Equipamento: ${call.equipment}
⚡ Prioridade: <b>${call.priority.toUpperCase()}</b>
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialCreatedNotification(transaction: any, userName: string = "Sistema") {
  return `💰 <b>Transação Criada</b>
━━━━━━━━━━━━━━━━
💳 Transação #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${transaction.amount}</b>
📊 Tipo: ${transaction.type === "entrada" ? '📥 ENTRADA' : '📤 SAÍDA'}
🔄 Status: ${transaction.status.toUpperCase()}
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatQuoteCreatedNotification(quote: any, userName: string = "Sistema") {
  return `📋 <b>Novo Orçamento Criado</b>
━━━━━━━━━━━━━━━━
📑 Orçamento #${quote.id}
👤 Cliente: ${quote.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${quote.totalAmount || '0,00'}</b>
🔄 Status: ${quote.status?.toUpperCase() || "PENDENTE"}
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatQuoteUpdatedNotification(quote: any, userName: string = "Sistema") {
  return `✏️ <b>Orçamento Atualizado</b>
━━━━━━━━━━━━━━━━
📑 Orçamento #${quote.id}
👤 Cliente: ${quote.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${quote.totalAmount || '0,00'}</b>
🔄 Status: ${quote.status?.toUpperCase() || "PENDENTE"}
📅 Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatCallDeletedNotification(call: any, userName: string = "Sistema") {
  return `🗑️ <b>Chamado Excluído</b>
━━━━━━━━━━━━━━━━
📞 Chamado #${call.id}
👤 Cliente: ${call.client?.name || "Sem cliente"}
🖥️ Equipamento: ${call.equipment}
⚡ Prioridade: <b>${call.priority.toUpperCase()}</b>
⏰ Hora da exclusão: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatServiceDeletedNotification(service: any, userName: string = "Sistema") {
  return `🗑️ <b>Serviço Excluído</b>
━━━━━━━━━━━━━━━━
🛠️ Serviço #${service.id}
👤 Cliente: ${service.client?.name || "Sem cliente"}
📋 Nome: <b>${service.name}</b>
💵 Valor: <b>R$ ${service.basePrice || '0,00'}</b>
⏰ Hora da exclusão: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialDeletedNotification(transaction: any, userName: string = "Sistema") {
  return `🗑️ <b>Transação Excluída</b>
━━━━━━━━━━━━━━━━
💳 Transação #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${transaction.amount}</b>
📊 Tipo: ${transaction.type === "entrada" ? '📥 ENTRADA' : '📤 SAÍDA'}
🔄 Status: ${transaction.status.toUpperCase()}
⏰ Hora da exclusão: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatClientDeletedNotification(client: any, userName: string = "Sistema") {
  return `🗑️ <b>Cliente Excluído</b>
━━━━━━━━━━━━━━━━
👤 Nome: <b>${client.name}</b>
📞 Telefone: ${client.phone || "N/A"}
✉️ Email: ${client.email || "N/A"}
📍 Endereço: ${client.address || "N/A"}
⏰ Hora da exclusão: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialDiscountNotification(transaction: any, discountAmount: number, userName: string = "Sistema") {
  return `💰 <b>Desconto Aplicado</b>
━━━━━━━━━━━━━━━━
💳 Transação #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor original: <b>R$ ${transaction.amount}</b>
💸 Desconto: <b>-R$ ${discountAmount.toFixed(2)}</b>
✅ Novo valor: <b>R$ ${(parseFloat(transaction.amount.toString()) - discountAmount).toFixed(2)}</b>
⏰ Hora: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialInstallmentNotification(transaction: any, installmentNumber: number, amount: number, userName: string = "Sistema") {
  return `📋 <b>Parcela Registrada</b>
━━━━━━━━━━━━━━━━
💳 Transação #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
🔢 Parcela: <b>#${installmentNumber}</b>
💰 Valor: <b>R$ ${amount.toFixed(2)}</b>
⏰ Hora: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialPaymentNotification(transaction: any, amount: number, userName: string = "Sistema") {
  return `✅ <b>Pagamento Registrado</b>
━━━━━━━━━━━━━━━━
💳 Transação #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${amount.toFixed(2)}</b>
📊 Tipo: ${transaction.type === "entrada" ? '📥 ENTRADA' : '📤 SAÍDA'}
⏰ Hora: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatFinancialPDFNotification(transaction: any, pdfType: string, userName: string = "Sistema") {
  const typeLabel = pdfType === 'receipt' ? '🧾 Recibo' : pdfType === 'service' ? '📋 Nota de Serviço' : '📊 Relatório';
  return `📄 <b>${typeLabel} Gerado</b>
━━━━━━━━━━━━━━━━
💳 Transação #${transaction.id}
👤 Cliente: ${transaction.client?.name || "Sem cliente"}
💵 Valor: <b>R$ ${transaction.amount}</b>
⏰ Hora: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatQuoteGeneratedNotification(service: any, userName: string = "Sistema") {
  return `📋 <b>Orçamento PDF Gerado</b>
━━━━━━━━━━━━━━━━
🛠️ Serviço #${service.id}
👤 Cliente: ${service.client?.name || "Sem cliente"}
📄 Orçamento: <b>${service.name}</b>
💵 Valor: <b>R$ ${service.basePrice || '0,00'}</b>
⏰ Hora: ${formatTimeBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatUserCreatedNotification(user: any, userName: string = "Sistema") {
  return `👤 <b>Novo Usuário Criado</b>
━━━━━━━━━━━━━━━━
👤 Nome: <b>${user.name}</b>
✉️ Usuário: ${user.username}
📧 Email: ${user.email || "N/A"}
🔐 Função: <b>${user.role?.toUpperCase() || "USUÁRIO"}</b>
⏰ Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

export function formatUserUpdatedNotification(user: any, userName: string = "Sistema") {
  return `✏️ <b>Usuário Atualizado</b>
━━━━━━━━━━━━━━━━
👤 Nome: <b>${user.name}</b>
✉️ Usuário: ${user.username}
📧 Email: ${user.email || "N/A"}
🔐 Função: <b>${user.role?.toUpperCase() || "USUÁRIO"}</b>
⏰ Data: ${formatDateBrazil()}
━━━━━━━━━━━━━━━━`;
}

// ============================================================================
// BACKUPS - AGENDAMENTO COM TELEGRAM
// ============================================================================
export function formatBackupNotification(status: "sucesso" | "erro" | "atrasado", fileSize?: number, scheduledTime?: Date, executedAt?: Date, errorMessage?: string): string {
  const statusEmoji = status === "sucesso" ? "✅" : status === "atrasado" ? "⏱️" : "❌";
  const statusText = status === "sucesso" ? "Sucesso" : status === "atrasado" ? "Atrasado" : "Erro";
  
  let message = `${statusEmoji} <b>Backup Automático - ${statusText}</b>\n━━━━━━━━━━━━━━━━\n`;
  
  if (scheduledTime) {
    message += `⏰ Agendado: ${new Date(scheduledTime).toLocaleString("pt-BR", { timeZone: "Etc/GMT+3" })}\n`;
  }
  
  if (executedAt) {
    message += `⚙️ Executado: ${new Date(executedAt).toLocaleString("pt-BR", { timeZone: "Etc/GMT+3" })}\n`;
  }
  
  if (fileSize) {
    const kb = fileSize / 1024;
    const mb = kb / 1024;
    const sizeText = mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
    message += `💾 Tamanho: <b>${sizeText}</b>\n`;
  }
  
  if (status === "atrasado" && scheduledTime && executedAt) {
    const diffMinutes = Math.floor((new Date(executedAt).getTime() - new Date(scheduledTime).getTime()) / (1000 * 60));
    message += `⏳ Atraso: <b>${diffMinutes} minutos</b>\n`;
  }
  
  if (errorMessage) {
    message += `📌 Erro: ${errorMessage}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━`;
  return message;
}

export async function sendBackupFileToTelegram(userId: number, fileBuffer: Buffer, filename: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    (async () => {
      try {
        const config = await storage.getTelegramConfig(userId);
        if (!config?.chatId || !config?.botToken) {
          console.log("❌ Telegram não configurado para usuário", userId);
          resolve(false);
          return;
        }

        console.log(`📤 Tentando enviar backup para Telegram - Chat: ${config.chatId}, Tamanho: ${fileBuffer.length} bytes`);

        const form = new FormData();
        form.append("chat_id", config.chatId);
        form.append("caption", message);
        form.append("parse_mode", "HTML");
        form.append("document", fileBuffer, filename);

        const options = {
          hostname: "api.telegram.org",
          path: `/bot${config.botToken}/sendDocument`,
          method: "POST",
          headers: form.getHeaders(),
        };

        const req = https.request(options, (res: any) => {
          let data = "";
          res.on("data", (chunk: any) => (data += chunk));
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.ok) {
                const messageId = parsed?.result?.message_id?.toString();
                console.log(`✅ Backup enviado para Telegram com sucesso (message_id: ${messageId})`);
                resolve(true);
              } else {
                const errorDesc = parsed?.description || "Unknown error";
                console.error(`❌ Telegram API error: ${errorDesc}`, JSON.stringify(parsed));
                resolve(false);
              }
            } catch (e) {
              console.error("Resposta Telegram (não é JSON):", data);
              resolve(false);
            }
          });
        });

        req.on("error", (err: any) => {
          console.error("❌ Erro ao enviar backup para Telegram:", err);
          resolve(false);
        });

        form.pipe(req);
      } catch (error) {
        console.error("❌ Erro ao enviar backup para Telegram:", error);
        resolve(false);
      }
    })();
  });
}

// NOVA FUNÇÃO: Envia backup para TODOS os usuários com Telegram configurado
export async function sendBackupFileToAllTelegram(fileBuffer: Buffer, filename: string, message: string): Promise<boolean> {
  try {
    const configs = await storage.getAllTelegramConfigs();
    
    if (!configs || configs.length === 0) {
      console.log("❌ Nenhum usuário com Telegram configurado para enviar backup");
      return false;
    }

    console.log(`📤 Enviando backup para ${configs.length} usuário(s)...`);
    
    let sentToAny = false;
    
    for (const config of configs) {
      if (!config.isActive || !config.chatId || !config.botToken) {
        console.log(`⏭️  Usuário ${config.userId} ignorado (não ativo ou não configurado)`);
        continue;
      }

      try {
        const form = new FormData();
        form.append("chat_id", config.chatId);
        form.append("caption", message);
        form.append("parse_mode", "HTML");
        form.append("document", fileBuffer, filename);

        const options = {
          hostname: "api.telegram.org",
          path: `/bot${config.botToken}/sendDocument`,
          method: "POST",
          headers: form.getHeaders(),
        };

        await new Promise<void>((resolveReq) => {
          const req = https.request(options, (res: any) => {
            let data = "";
            res.on("data", (chunk: any) => (data += chunk));
            res.on("end", () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.ok) {
                  console.log(`✅ Backup enviado para usuário ${config.userId}`);
                  sentToAny = true;
                } else {
                  console.error(`❌ Erro ao enviar para usuário ${config.userId}:`, parsed.description);
                }
              } catch (e) {
                console.error(`❌ Erro JSON para usuário ${config.userId}`);
              }
              resolveReq();
            });
          });

          req.on("error", (err: any) => {
            console.error(`❌ Erro ao enviar para usuário ${config.userId}:`, err.message);
            resolveReq();
          });

          form.pipe(req);
        });
      } catch (error) {
        console.error(`❌ Erro processando usuário ${config.userId}:`, error);
      }
    }

    return sentToAny;
  } catch (error) {
    console.error("❌ Erro ao enviar backup para todos os usuários:", error);
    return false;
  }
}
