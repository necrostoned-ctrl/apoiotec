import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User } from 'lucide-react';

interface HistoryEvent {
  id: number;
  eventType: string;
  description: string;
  userId: number | null;
  createdAt: string;
  metadata?: string;
}

interface HistoryTimelineProps {
  events: HistoryEvent[];
  userName?: string;
}

export function HistoryTimeline({ events, userName }: HistoryTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum evento no histórico</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">📋 Histórico de Alterações</h3>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900" />
              {index < events.length - 1 && (
                <div className="w-1 h-12 bg-gray-200 dark:bg-gray-700 mt-2" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pb-4">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {getEventLabel(event.eventType)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>{userName || 'Sistema'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="text-xs">
                    {new Date(event.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getEventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    'call_created': '🎯 Chamado Criado',
    'call_updated': '✏️ Chamado Atualizado',
    'call_deleted': '🗑️ Chamado Deletado',
    'call_converted': '✅ Convertido para Serviço',
    'service_created': '🆕 Serviço Criado',
    'service_updated': '✏️ Serviço Atualizado',
    'service_deleted': '🗑️ Serviço Deletado',
    'service_converted': '💳 Convertido para Financeiro',
    'transaction_created': '💰 Transação Criada',
    'transaction_updated': '📝 Transação Atualizada',
    'transaction_deleted': '🗑️ Transação Deletada',
    'payment_received': '💚 Pagamento Recebido',
    'client_created': '🎉 Cliente Criado',
    'client_updated': '✏️ Cliente Atualizado',
    'client_deleted': '🗑️ Cliente Deletado',
  };
  return labels[eventType] || eventType;
}
