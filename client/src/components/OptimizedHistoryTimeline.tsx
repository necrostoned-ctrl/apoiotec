import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User } from 'lucide-react';
import { useMemo, useState } from 'react';

interface HistoryEvent {
  id: number;
  eventType: string;
  description: string;
  userId: number | null;
  userName?: string;
  createdAt: string;
  metadata?: string;
}

interface OptimizedHistoryTimelineProps {
  events: HistoryEvent[];
  maxDisplay?: number;
}

export function OptimizedHistoryTimeline({ events, maxDisplay = 10 }: OptimizedHistoryTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayedEvents = useMemo(() => {
    return showAll ? events : events.slice(0, maxDisplay);
  }, [events, showAll, maxDisplay]);

  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum evento no histórico</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Clock className="w-4 h-4" />
        📋 Histórico ({events.length})
      </h3>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {displayedEvents.map((event, index) => (
          <div key={event.id} className="flex gap-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
              {index < displayedEvents.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700 mt-2" />
              )}
            </div>

            {/* Event card */}
            <div className="flex-1 pb-2">
              <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-700 text-xs">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  {getEventLabel(event.eventType)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {event.userName || 'Sistema'}
                  </span>
                  <span title={new Date(event.createdAt).toLocaleString('pt-BR')}>
                    {formatDistanceToNow(new Date(event.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length > maxDisplay && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Mostrar mais {events.length - maxDisplay} eventos
        </button>
      )}
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
