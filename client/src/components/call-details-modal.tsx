import { X, Clock } from "lucide-react";
import { formatDate, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface CallDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: any;
  onEdit?: (call: any) => void;
}

function HistoryTimelineCompact({ callId }: { callId: number }) {
  const { data: events = [] } = useQuery<any[]>({
    queryKey: [`/api/history/call/${callId}`],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  if (events.length === 0) {
    return null;
  }

  const eventLabels: Record<string, string> = {
    call_created: 'Chamado Criado',
    converted_to_service: 'Convertido em Serviço',
    service_updated: 'Serviço Atualizado',
    converted_to_financial: 'Convertido para Faturamento',
    invoiced: 'Faturado',
    payment_received: 'Pagamento Recebido',
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Histórico ({events.length})
      </p>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {events.slice(0, 10).map((event) => (
          <div key={event.id} className="flex items-start gap-3 text-sm">
            <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-orange-500" />
            <div className="flex-1">
              <p className="text-white font-medium">
                {eventLabels[event.eventType] || event.eventType}
              </p>
              <p className="text-gray-400 text-xs">{event.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(event.createdAt)} • {event.userName || 'Sistema'}
              </p>
            </div>
          </div>
        ))}
        {events.length > 10 && (
          <div className="text-xs text-gray-500 text-center py-2">
            +{events.length - 10} eventos adicionais
          </div>
        )}
      </div>
    </div>
  );
}

export function CallDetailsModal({ isOpen, onClose, call, onEdit }: CallDetailsModalProps) {
  if (!isOpen || !call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-orange-500 rounded-lg shadow-2xl shadow-orange-500/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-800 border-b-2 border-orange-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">📞 Detalhes do Chamado</h2>
          <button onClick={onClose} className="text-orange-400 hover:text-orange-300 transition p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-4">
          
          {/* Equipamento */}
          <div className="bg-slate-800 border-2 border-orange-500/40 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Equipamento</p>
            <p className="text-lg font-bold text-white">{call.equipment}</p>
          </div>

          {/* Prioridade e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Prioridade</p>
              <Badge variant="outline" className={`${getPriorityColor(call.priority)} text-xs px-2 py-1 font-semibold`}>
                {getPriorityLabel(call.priority)}
              </Badge>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Status</p>
              <p className="text-sm text-white font-semibold capitalize">{call.status || "Sem status"}</p>
            </div>
          </div>

          {/* Tipo de Serviço */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tipo de Serviço</p>
            <p className="text-sm text-white">{call.serviceType || "Não especificado"}</p>
          </div>

          {/* Descrição */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Descrição</p>
            <p className="text-sm text-white">{call.description || "Sem descrição"}</p>
          </div>

          {/* Notas internas */}
          {call.internalNotes && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Notas Internas</p>
              <p className="text-sm text-white">{call.internalNotes}</p>
            </div>
          )}

          {/* Progresso */}
          {call.progress !== undefined && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Progresso</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${call.progress}%` }}></div>
                </div>
                <p className="text-sm text-white font-semibold">{call.progress}%</p>
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Data do Chamado</p>
              <p className="text-sm text-white">{call.callDate ? formatDate(call.callDate) : "Não especificada"}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Data de Criação</p>
              <p className="text-sm text-white">{formatDate(call.createdAt)}</p>
            </div>
          </div>

          {/* Histórico Compacto */}
          <HistoryTimelineCompact callId={call.id} />
        </div>

        {/* Footer */}
        <div className="bg-slate-800 border-t-2 border-orange-500 px-6 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black hover:bg-slate-900 border-2 border-orange-500 hover:border-orange-400 text-orange-300 hover:text-orange-200 rounded text-sm font-semibold transition"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              if (onEdit) onEdit(call);
              onClose();
            }}
            className="px-4 py-2 bg-black hover:bg-slate-900 border-2 border-orange-500 hover:border-orange-400 text-orange-300 hover:text-orange-200 rounded text-sm font-semibold transition flex items-center gap-2"
          >
            ✏️ Editar
          </button>
        </div>
      </div>
    </div>
  );
}
