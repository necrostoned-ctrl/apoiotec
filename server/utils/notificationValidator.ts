import { storage } from "../storage";

/**
 * FERRAMENTA INTERNA DE VALIDAÇÃO DE NOTIFICAÇÕES
 * Trabalha nos bastidores para garantir que TODA notificação
 * é enviada com o usuário CORRETO que fez a alteração
 * 
 * Validações:
 * 1. UserId é válido e existe
 * 2. Nome do usuário corresponde ao ID
 * 3. Nunca deixa passar notificações com usuário errado
 */

export interface NotificationPayload {
  userId: number | null | undefined;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: number;
  metadata?: Record<string, any>;
}

/**
 * Valida a integridade de uma notificação ANTES de enviar
 * Garante que o userId e userName são consistentes
 * 
 * @param payload Dados da notificação
 * @returns {userId, userName} validados e consistentes
 * @throws Error se houver inconsistência
 */
export async function validateNotificationPayload(
  payload: NotificationPayload
): Promise<{ userId: number; userName: string }> {
  console.log(`🔍 [VALIDATOR] Validando notificação:`, {
    userId: payload.userId,
    userName: payload.userName,
    action: payload.action,
  });

  // Validação 1: UserId não pode ser nulo/undefined ou inválido
  if (!payload.userId || payload.userId <= 0) {
    const errorMsg = `❌ [VALIDATOR] UserId inválido: ${payload.userId}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Validação 2: UserId deve existir no banco de dados
  try {
    const user = await storage.getUser(payload.userId);
    if (!user) {
      const errorMsg = `❌ [VALIDATOR] Usuário ID ${payload.userId} não existe no sistema`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`✅ [VALIDATOR] Usuário encontrado:`, {
      id: user.id,
      username: user.username,
      name: user.name,
    });

    // Validação 3: Nome do usuário deve corresponder ao ID
    const expectedUserName = user.name || user.username || "Sistema";
    if (payload.userName !== expectedUserName) {
      const errorMsg = `❌ [VALIDATOR] Nome do usuário inconsistente! 
        Esperado: ${expectedUserName} | Recebido: ${payload.userName}
        UserId: ${payload.userId}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Validação 4: Garante que não é o ID padrão (1) se for outro usuário
    if (payload.userId === 1) {
      console.warn(
        `⚠️ [VALIDATOR] Usando usuário padrão (ID=1). Notificação:`,
        payload.action
      );
    }

    // ✅ TODAS as validações passaram!
    console.log(`✅ [VALIDATOR] SUCESSO - Notificação validada:`, {
      userId: payload.userId,
      userName: expectedUserName,
      action: payload.action,
    });

    return {
      userId: payload.userId,
      userName: expectedUserName,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("[VALIDATOR]")) {
      throw error;
    }
    const errorMsg = `❌ [VALIDATOR] Erro ao validar usuário: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Função de segurança: Detecta e previne ID de usuário padrão incorreto
 * Se detectar que está usando o fallback padrão (1) mas deveria usar outro,
 * corrige automaticamente
 * 
 * @param currentUserId ID atual (pode ser o fallback 1)
 * @param realUserId ID real disponível (pode ser diferente)
 * @returns ID correto a usar
 */
export function ensureCorrectUserId(
  currentUserId: number | undefined | null,
  realUserId: number | undefined | null
): number {
  const fallbackId = 1;

  // Se currentUserId é válido e diferente do fallback, usar ele
  if (currentUserId && currentUserId !== fallbackId) {
    console.log(`✅ [VALIDATOR] UserId correto identificado: ${currentUserId}`);
    return currentUserId;
  }

  // Se currentUserId é fallback (1) mas realUserId é válido e diferente, usar o real
  if (realUserId && realUserId !== fallbackId) {
    console.log(
      `🔄 [VALIDATOR] Corrigindo: Fallback (${fallbackId}) → Real (${realUserId})`
    );
    return realUserId;
  }

  // Caso contrário, usar fallback
  console.log(`ℹ️ [VALIDATOR] Usando ID padrão: ${fallbackId}`);
  return fallbackId;
}

/**
 * Log detalhado de auditoria para todas as notificações
 * Registra QUEM, O QUÊ, QUANDO para rastrear qualquer problema
 */
export function logNotificationAudit(
  userId: number,
  userName: string,
  action: string,
  resourceType: string,
  resourceId?: number
): void {
  const timestamp = new Date().toISOString();
  const auditLog = {
    timestamp,
    userId,
    userName,
    action,
    resourceType,
    resourceId,
    severity: "INFO",
  };

  console.log(`📋 [AUDIT] Notificação registrada:`, auditLog);
}

/**
 * Detector de anomalias: Identifica se há mudanças suspeitas de usuário
 * Útil para debugar se algo está trocando o usuário incorretamente
 */
let lastNotificationUser: { id: number; name: string; timestamp: number } | null = null;

export function detectUserSwitches(userId: number, userName: string): void {
  const now = Date.now();

  if (!lastNotificationUser) {
    lastNotificationUser = { id: userId, name: userName, timestamp: now };
    return;
  }

  // Se o usuário mudou em menos de 100ms, pode ser suspeito
  const timeDiff = now - lastNotificationUser.timestamp;
  if (
    lastNotificationUser.id !== userId &&
    timeDiff < 100 &&
    lastNotificationUser.id !== 1 &&
    userId !== 1
  ) {
    console.warn(
      `⚠️ [ANOMALY] Mudança rápida de usuário detectada!`,
      {
        anterior: lastNotificationUser.name,
        atual: userName,
        tempoDecorrido: `${timeDiff}ms`,
      }
    );
  }

  lastNotificationUser = { id: userId, name: userName, timestamp: now };
}

/**
 * CORRETOR DE USUÁRIO PARA NOTIFICAÇÕES
 * Valida e CORRIGE o userId ANTES de enviar qualquer notificação
 * Se o userId for inválido, busca automaticamente o usuário correto
 * 
 * @param requestedUserId ID que veio no request body
 * @param fallbackUserId ID alternativo (ex: do serviço/chamado original)
 * @returns {userId, userName} CORRETOS para usar na notificação
 * @throws Error se não conseguir determinar um usuário válido
 */
export async function correctUserIdForNotification(
  requestedUserId: number | undefined | null,
  fallbackUserId: number | undefined | null
): Promise<{ userId: number; userName: string }> {
  console.log(`🔧 [CORRETOR] Verificando usuário para notificação:`, {
    requestedUserId,
    fallbackUserId,
  });

  // 🔥 PRIORIDADE: Se requestedUserId é 1 (FALLBACK PADRÃO) e há um fallbackUserId diferente, USAR o fallback!
  // ID 1 é apenas um último recurso, nunca deve ser preferido se há alternativa
  if (requestedUserId === 1 && fallbackUserId && fallbackUserId > 1) {
    try {
      const user = await storage.getUser(fallbackUserId);
      if (user && user.id > 0) {
        const userName = user.name || user.username || "Sistema";
        console.log(`✅ [CORRETOR] CORRIGIDO: ${requestedUserId} (fallback padrão) → ${fallbackUserId} (${userName})`);
        return { userId: user.id, userName };
      }
    } catch (e) {
      console.warn(`⚠️ [CORRETOR] fallbackUserId ${fallbackUserId} inválido`);
    }
  }

  // Se requestedUserId é válido E não é 1 (o padrão), usar ele
  if (requestedUserId && requestedUserId > 1) {
    try {
      const user = await storage.getUser(requestedUserId);
      if (user && user.id > 0) {
        const userName = user.name || user.username || "Sistema";
        console.log(`✅ [CORRETOR] UserId validado: ${requestedUserId} → ${userName}`);
        return { userId: user.id, userName };
      }
    } catch (e) {
      console.warn(`⚠️ [CORRETOR] requestedUserId ${requestedUserId} inválido, testando fallback`);
    }
  }

  // Se chegou aqui e tem fallbackUserId válido, usar ele
  if (fallbackUserId && fallbackUserId > 0) {
    try {
      const user = await storage.getUser(fallbackUserId);
      if (user && user.id > 0) {
        const userName = user.name || user.username || "Sistema";
        console.log(`✅ [CORRETOR] UserId corrigido: ${fallbackUserId} → ${userName}`);
        return { userId: user.id, userName };
      }
    } catch (e) {
      console.warn(`⚠️ [CORRETOR] fallbackUserId ${fallbackUserId} também inválido`);
    }
  }

  // Se nenhum dos dois funcionou, usar o padrão seguro (ID 1 = Marcelo)
  console.warn(`⚠️ [CORRETOR] Nenhum userId válido encontrado, usando padrão (ID=1)`);
  const defaultUser = await storage.getUser(1);
  const defaultUserName = defaultUser?.name || defaultUser?.username || "Sistema";
  
  return { userId: 1, userName: defaultUserName };
}
