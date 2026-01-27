import { useState } from "react";
import { X, Eye, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { CallDetailsModal } from "@/components/call-details-modal";
import { ServiceDetailsModal } from "@/components/service-details-modal";

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  results: {
    services: any[];
    calls: any[];
    transactions: any[];
  };
}

export function SearchResultsModal({ isOpen, onClose, clientName, results }: SearchResultsModalProps) {
  const [transactionFilter, setTransactionFilter] = useState("todos");
  const [serviceFilter, setServiceFilter] = useState("todos");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);

  if (!isOpen) return null;

  const filteredTransactions = results.transactions.filter(t => {
    if (transactionFilter === "pago") return t.status === "pago" && t.type === "entrada";
    if (transactionFilter === "pendente") return (t.status === "pendente" || t.status === "parcial") && t.type === "entrada";
    if (transactionFilter === "despesas") return t.type === "saida";
    return true;
  });

  const filteredServices = results.services.filter(s => {
    if (serviceFilter === "ativo") return s.status !== "concluido";
    if (serviceFilter === "concluido") return s.status === "concluido";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-cyan-500 rounded-lg shadow-2xl shadow-cyan-500/30 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-800 border-b-2 border-cyan-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">🔍 Resultados: <span className="text-cyan-300">{clientName}</span></h2>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 transition p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
          
          {/* Chamados */}
          {results.calls.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-1 bg-gradient-to-b from-orange-500 to-orange-600"></div>
                <h3 className="text-lg font-bold text-white">📞 Chamados ({results.calls.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.calls.map(call => (
                  <div key={call.id} className="bg-black border-2 border-orange-500/60 rounded-lg p-4 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/30 transition">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-semibold text-white text-sm flex-1 break-words">{call.equipment}</h4>
                      <BadgeUI variant="outline" className={`${getPriorityColor(call.priority)} text-xs h-4 px-1 border font-semibold flex-shrink-0`}>
                        {getPriorityLabel(call.priority)}
                      </BadgeUI>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 break-words">{call.description}</p>
                    <button onClick={() => setSelectedCall(call)} className="w-full bg-black hover:bg-slate-900 hover:shadow-lg hover:shadow-orange-500/40 text-orange-300 hover:text-orange-200 text-xs py-1.5 rounded font-semibold flex items-center justify-center gap-1 transition border-2 border-orange-500/60 hover:border-orange-500">
                        <Eye className="h-3 w-3" /> Ver Chamado
                      </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Serviços */}
          {filteredServices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-purple-600"></div>
                  <h3 className="text-lg font-bold text-white">🔧 Serviços ({filteredServices.length})</h3>
                </div>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="text-xs bg-slate-800 border border-purple-500/40 text-white rounded px-2 py-1 hover:border-purple-500/80 transition"
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredServices.map(service => (
                  <div key={service.id} className="bg-black border-2 border-blue-500/60 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition">
                    <h4 className="font-semibold text-white text-sm mb-1 break-words">{service.name}</h4>
                    <p className="text-xs text-gray-400 mb-3 break-words">{service.description || "Sem descrição"}</p>
                    <button onClick={() => setSelectedService(service)} className="w-full bg-black hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-500/40 text-blue-300 hover:text-blue-200 text-xs py-1.5 rounded font-semibold flex items-center justify-center gap-1 transition border-2 border-blue-500/60 hover:border-blue-500">
                        <Eye className="h-3 w-3" /> Ver Serviço
                      </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transações */}
          {results.transactions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-gradient-to-b from-green-500 to-green-600"></div>
                  <h3 className="text-lg font-bold text-white">💰 Financeiro ({filteredTransactions.length})</h3>
                </div>
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  className="text-xs bg-slate-800 border border-green-500/40 text-white rounded px-2 py-1 hover:border-green-500/80 transition"
                >
                  <option value="todos">Todas</option>
                  <option value="pago">Pagas</option>
                  <option value="pendente">Pendentes</option>
                  <option value="despesas">Despesas</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTransactions.map(trans => (
                  <div key={trans.id} className={`border-2 rounded-lg p-4 hover:shadow-lg transition ${
                    trans.type === "entrada" && trans.status === "pago" ? "bg-black border-green-500/60 hover:border-green-500 hover:shadow-green-500/30" :
                    trans.type === "entrada" && (trans.status === "pendente" || trans.status === "parcial") ? "bg-black border-yellow-500/60 hover:border-yellow-500 hover:shadow-yellow-500/30" :
                    "bg-black border-red-500/60 hover:border-red-500 hover:shadow-red-500/30"
                  }`}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-400 uppercase">Descrição</p>
                        <p className="text-sm text-white break-words">{trans.description}</p>
                      </div>
                      <span className={`text-lg font-bold flex-shrink-0 ${
                        trans.type === "entrada" ? "text-green-400" : "text-red-400"
                      }`}>
                        {trans.type === "entrada" ? "+" : "-"}{formatCurrency(parseFloat(trans.amount.toString()))}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3 text-xs">
                      <BadgeUI variant="outline" className={`${getStatusColor(trans.status)} text-xs h-4 px-1 border font-semibold flex-shrink-0`}>
                        {trans.status}
                      </BadgeUI>
                      <span className="text-gray-500">{formatDate(trans.createdAt).split(" ")[0]}</span>
                    </div>
                    <button onClick={() => setSelectedTransaction(trans)} className={`w-full text-xs py-1.5 rounded font-semibold flex items-center justify-center gap-1 transition border-2 ${
                        trans.type === "entrada" && trans.status === "pago" ? "bg-black hover:bg-slate-900 hover:shadow-lg hover:shadow-green-500/40 border-green-500/60 hover:border-green-500 text-green-300 hover:text-green-200" :
                        "bg-black hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-500/40 border-blue-500/60 hover:border-blue-500 text-blue-300 hover:text-blue-200"
                      }`}>
                        <Eye className="h-3 w-3" /> Ver {trans.type === "entrada" ? "Entrada" : "Despesa"}
                      </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sem resultados */}
          {results.calls.length === 0 && filteredServices.length === 0 && filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-cyan-500/50 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum resultado encontrado para este cliente</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 border-t-2 border-cyan-500 px-6 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-cyan-500/40 text-cyan-300 rounded text-sm font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modals de Detalhes */}
      <TransactionDetailsModal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} transaction={selectedTransaction} onEdit={() => {}} />
      <CallDetailsModal isOpen={!!selectedCall} onClose={() => setSelectedCall(null)} call={selectedCall} onEdit={() => {}} />
      <ServiceDetailsModal isOpen={!!selectedService} onClose={() => setSelectedService(null)} service={selectedService} onEdit={() => {}} />
    </div>
  );
}
