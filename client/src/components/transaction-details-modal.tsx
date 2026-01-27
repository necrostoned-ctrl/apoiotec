import { X, Clock } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onEdit?: (transaction: any) => void;
}

function HistoryTimelineCompact({ transactionId }: { transactionId: number }) {
  const { data: events = [] } = useQuery<any[]>({
    queryKey: [`/api/history/transaction/${transactionId}`],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  if (events.length === 0) {
    return null;
  }

  const eventLabels: Record<string, string> = {
    transaction_created: 'Transação Criada',
    transaction_updated: 'Transação Atualizada',
    payment_received: 'Pagamento Recebido',
    converted_to_invoice: 'Convertido para Faturamento',
    invoiced: 'Faturado',
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
            <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-green-500" />
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

export function TransactionDetailsModal({ isOpen, onClose, transaction, onEdit }: TransactionDetailsModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-green-500 rounded-lg shadow-2xl shadow-green-500/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-800 border-b-2 border-green-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">💰 Detalhes da {transaction.type === "entrada" ? "Entrada" : "Despesa"}</h2>
          <button onClick={onClose} className="text-green-400 hover:text-green-300 transition p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-4">
          
          {/* Valor em destaque */}
          <div className="bg-black border-2 border-green-500/40 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Valor Total</p>
            <p className={`text-4xl font-bold ${transaction.type === "entrada" ? "text-green-400" : "text-red-400"}`}>
              {transaction.type === "entrada" ? "+" : "-"}{formatCurrency(parseFloat(transaction.amount.toString()))}
            </p>
          </div>

          {/* Status e Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Status</p>
              <Badge variant="outline" className={`${getStatusColor(transaction.status)} text-xs px-2 py-1 font-semibold`}>
                {transaction.status}
              </Badge>
            </div>
            <div className="bg-black border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tipo</p>
              <p className="text-sm text-white font-semibold capitalize">{transaction.type === "entrada" ? "Receita" : "Despesa"}</p>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black border border-slate-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Data de Criação</p>
              <p className="text-sm text-white">{formatDate(transaction.createdAt)}</p>
            </div>
            {transaction.paidAt && (
              <div className="bg-black border border-slate-700 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Data de Pagamento</p>
                <p className="text-sm text-white">{formatDate(transaction.paidAt)}</p>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="bg-black border border-slate-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Descrição</p>
            <p className="text-sm text-white">{transaction.description || "Sem descrição"}</p>
          </div>

          {/* Informações adicionais */}
          {(transaction.originalAmount || transaction.discountAmount || transaction.dueDate) && (
            <div className="space-y-3">
              {transaction.originalAmount && (
                <div className="bg-black border border-slate-700 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Valor Original</p>
                  <p className="text-sm text-white">{formatCurrency(parseFloat(transaction.originalAmount.toString()))}</p>
                </div>
              )}
              {transaction.discountAmount && (
                <div className="bg-black border border-slate-700 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Desconto Aplicado</p>
                  <p className="text-sm text-red-400">{formatCurrency(parseFloat(transaction.discountAmount.toString()))}</p>
                </div>
              )}
              {transaction.dueDate && (
                <div className="bg-black border border-slate-700 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Data de Vencimento</p>
                  <p className="text-sm text-white">{formatDate(transaction.dueDate)}</p>
                </div>
              )}
            </div>
          )}

          {/* Serviços */}
          {transaction.serviceDetails && (
            <div className="bg-black border border-blue-500/40 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-400 uppercase mb-3">🔧 Serviços</p>
              <div className="space-y-2">
                {(() => {
                  try {
                    const services = typeof transaction.serviceDetails === 'string' 
                      ? JSON.parse(transaction.serviceDetails) 
                      : transaction.serviceDetails;
                    return Array.isArray(services) ? services : [services];
                  } catch {
                    return [];
                  }
                })().map((service: any, idx: number) => (
                  <div key={idx} className="bg-slate-800 border-l-4 border-blue-400 pl-3 py-2">
                    <p className="text-sm text-white font-medium">{service.name || service.description}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(parseFloat(service.amount || service.price || "0"))}</p>
                  </div>
                ))}
              </div>
              {transaction.serviceAmount && (
                <div className="mt-2 pt-2 border-t border-blue-500/20">
                  <p className="text-xs text-blue-400">Subtotal Serviços: {formatCurrency(parseFloat(transaction.serviceAmount.toString()))}</p>
                </div>
              )}
            </div>
          )}

          {/* Produtos */}
          {transaction.productDetails && (
            <div className="bg-black border border-amber-500/40 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-400 uppercase mb-3">📦 Produtos</p>
              <div className="space-y-2">
                {(() => {
                  try {
                    const products = typeof transaction.productDetails === 'string' 
                      ? JSON.parse(transaction.productDetails) 
                      : transaction.productDetails;
                    return Array.isArray(products) ? products : [products];
                  } catch {
                    return [];
                  }
                })().map((product: any, idx: number) => (
                  <div key={idx} className="bg-slate-800 border-l-4 border-amber-400 pl-3 py-2">
                    <p className="text-sm text-white font-medium">{product.name || product.description}</p>
                    <p className="text-xs text-gray-400">Qtd: {product.quantity || 1} × {formatCurrency(parseFloat(product.unitPrice || product.price || "0"))}</p>
                  </div>
                ))}
              </div>
              {transaction.productAmount && (
                <div className="mt-2 pt-2 border-t border-amber-500/20">
                  <p className="text-xs text-amber-400">Subtotal Produtos: {formatCurrency(parseFloat(transaction.productAmount.toString()))}</p>
                </div>
              )}
            </div>
          )}

          {/* Histórico Compacto */}
          <HistoryTimelineCompact transactionId={transaction.id} />
        </div>

        {/* Footer */}
        <div className="bg-slate-800 border-t-2 border-green-500 px-6 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black hover:bg-slate-900 border-2 border-green-500 hover:border-green-400 text-green-300 hover:text-green-200 rounded text-sm font-semibold transition"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              if (onEdit) onEdit(transaction);
              onClose();
            }}
            className="px-4 py-2 bg-black hover:bg-slate-900 border-2 border-green-500 hover:border-green-400 text-green-300 hover:text-green-200 rounded text-sm font-semibold transition flex items-center gap-2"
          >
            ✏️ Editar
          </button>
        </div>
      </div>
    </div>
  );
}
