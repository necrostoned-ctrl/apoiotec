import { X, Clock } from "lucide-react";
import { formatDate, getPriorityColor, getPriorityLabel, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  onEdit?: (service: any) => void;
}

function HistoryTimelineCompact({ serviceId }: { serviceId: number }) {
  const { data: events = [] } = useQuery<any[]>({
    queryKey: [`/api/history/service/${serviceId}`],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  if (events.length === 0) {
    return null;
  }

  const eventLabels: Record<string, string> = {
    service_created: 'Serviço Criado',
    service_updated: 'Serviço Atualizado',
    converted_to_financial: 'Convertido para Faturamento',
    invoiced: 'Faturado',
    payment_received: 'Pagamento Recebido',
  };

  return (
    <div className="bg-black border border-slate-700 rounded-lg p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Histórico ({events.length})
      </p>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {events.slice(0, 10).map((event) => (
          <div key={event.id} className="flex items-start gap-3 text-sm">
            <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
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

export function ServiceDetailsModal({ isOpen, onClose, service, onEdit }: ServiceDetailsModalProps) {
  if (!isOpen || !service) return null;

  const products = service.products ? JSON.parse(service.products) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-blue-500 rounded-lg shadow-2xl shadow-blue-500/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-black border-b-2 border-blue-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">🔧 Detalhes do Serviço</h2>
          <button onClick={onClose} className="text-blue-400 hover:text-blue-300 transition p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-4">
          
          {/* Nome do Serviço */}
          <div className="bg-black border-2 border-blue-500/40 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Nome do Serviço</p>
            <p className="text-lg font-bold text-white">{service.name}</p>
          </div>

          {/* Prioridade */}
          <div className="bg-black border border-slate-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Prioridade</p>
            <Badge variant="outline" className={`${getPriorityColor(service.priority || "media")} text-xs px-2 py-1 font-semibold`}>
              {getPriorityLabel(service.priority || "media")}
            </Badge>
          </div>

          {/* Descrição */}
          <div className="bg-black border border-slate-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Descrição</p>
            <p className="text-sm text-white">{service.description || "Sem descrição"}</p>
          </div>

          {/* Valor Base */}
          {service.basePrice && (
            <div className="bg-black border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Valor Base</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(parseFloat(service.basePrice.toString()))}</p>
            </div>
          )}

          {/* Tempo Estimado */}
          {service.estimatedTime && (
            <div className="bg-black border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tempo Estimado</p>
              <p className="text-sm text-white">{service.estimatedTime}</p>
            </div>
          )}

          {/* Produtos/Materiais */}
          {products.length > 0 && (
            <div className="bg-black border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Produtos/Materiais</p>
              <div className="space-y-2">
                {products.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start border-l-2 border-blue-500/40 pl-3 py-1">
                    <div>
                      <p className="text-sm text-white font-semibold">{p.name || p.description}</p>
                      {p.quantity && <p className="text-xs text-gray-400">Qtd: {p.quantity}</p>}
                    </div>
                    {p.price && <p className="text-sm font-bold text-green-400">{formatCurrency(parseFloat(p.price))}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Data do Serviço</p>
              <p className="text-sm text-white">{service.serviceDate ? formatDate(service.serviceDate) : "Não especificada"}</p>
            </div>
            <div className="bg-black border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Data de Criação</p>
              <p className="text-sm text-white">{formatDate(service.createdAt)}</p>
            </div>
          </div>

          {/* Histórico Compacto */}
          <HistoryTimelineCompact serviceId={service.id} />
        </div>

        {/* Footer */}
        <div className="bg-black border-t-2 border-blue-500 px-6 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black hover:bg-slate-900 border-2 border-blue-500 hover:border-blue-400 text-blue-300 hover:text-blue-200 rounded text-sm font-semibold transition"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              if (onEdit) onEdit(service);
              onClose();
            }}
            className="px-4 py-2 bg-black hover:bg-slate-900 border-2 border-blue-500 hover:border-blue-400 text-blue-300 hover:text-blue-200 rounded text-sm font-semibold transition flex items-center gap-2"
          >
            ✏️ Editar
          </button>
        </div>
      </div>
    </div>
  );
}
