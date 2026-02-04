import { useState, useEffect, useRef } from "react";
import { Search, X, Users, Wrench, Phone, DollarSign, FileText, Settings, LayoutDashboard, Book, Bell, Lock, BarChart3, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SearchResult {
  clients: any[];
  services: any[];
  calls: any[];
  transactions: any[];
  notes: any[];
  pages: any[];
}

// Páginas/Menus do sistema
const SYSTEM_PAGES = [
  { id: "dashboard", name: "Dashboard", description: "Visão geral do sistema", icon: LayoutDashboard, href: "/" },
  { id: "calls", name: "Chamados", description: "Gerenciamento de chamados técnicos", icon: Phone, href: "/calls" },
  { id: "services", name: "Serviços", description: "Controle de serviços", icon: Wrench, href: "/services" },
  { id: "clients", name: "Clientes", description: "Base de clientes", icon: Users, href: "/clients" },
  { id: "financial", name: "Financeiro", description: "Entradas, saídas e faturamento", icon: DollarSign, href: "/financial" },
  { id: "quotes", name: "Orçamentos", description: "Gestão de orçamentos", icon: FileText, href: "/quotes" },
  { id: "reports", name: "Relatórios", description: "Relatórios e análises", icon: BarChart3, href: "/reports" },
  { id: "notifications", name: "Configurações de Notificações", description: "Gerenciar notificações", icon: Bell, href: "/settings?tab=notifications" },
  { id: "settings", name: "Configurações", description: "Ajustes do sistema", icon: Settings, href: "/settings" },
  { id: "knowledge-base", name: "Base de Conhecimento", description: "Artigos e documentação", icon: Book, href: "/knowledge-base" },
];

export function UniversalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    clients: [],
    services: [],
    calls: [],
    transactions: [],
    notes: [],
    pages: []
  });
  const debounceTimer = useRef<NodeJS.Timeout>();

  const { data } = useQuery({
    queryKey: ["/api/search", query],
    enabled: query.length >= 1,
    queryFn: async () => {
      if (query.length < 1) return null;
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      return res.json();
    },
    staleTime: 500,
    gcTime: 2000
  });

  useEffect(() => {
    if (data) {
      // Buscar páginas do sistema que correspondem
      const pageMatches = SYSTEM_PAGES.filter(page =>
        page.name.toLowerCase().includes(query.toLowerCase()) ||
        page.description.toLowerCase().includes(query.toLowerCase())
      );

      setResults({
        ...data,
        pages: pageMatches
      });
    }
  }, [data]);

  const handleClear = () => {
    setQuery("");
    setResults({ clients: [], services: [], calls: [], transactions: [], notes: [], pages: [] });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsOpen(true);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);

    // Debounce: abre depois de 800ms parado
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.length >= 1) {
      debounceTimer.current = setTimeout(() => {
        setIsOpen(true);
      }, 800);
    }
  };

  const hasResults = results.clients.length > 0 || results.services.length > 0 || 
                     results.calls.length > 0 || results.transactions.length > 0 || 
                     results.notes.length > 0 || results.pages.length > 0;

  const totalResults = results.clients.length + results.services.length + results.calls.length + 
                      results.transactions.length + results.notes.length + results.pages.length;

  return (
    <>
      <div className="w-full">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 rounded-lg blur opacity-40 group-focus-within:opacity-75 transition duration-300"></div>
          
          {/* Input */}
          <div className="relative flex items-center bg-slate-800 border-2 border-slate-700 hover:border-cyan-500/50 focus-within:border-cyan-500 rounded-lg transition-all">
            <Search className="absolute left-4 h-5 w-5 text-cyan-400" />
            <input
              type="text"
              placeholder="🔍 Buscar: clientes, serviços, relatórios, configurações... (Enter para abrir)"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-10 py-3 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg text-sm focus:outline-none transition-all"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Resultados */}
      <Dialog open={isOpen && (query.length >= 1 || hasResults)} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] bg-slate-900 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/30 overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-xl">
              Resultados {totalResults > 0 && `(${totalResults})`}
            </DialogTitle>
          </DialogHeader>

          {!hasResults ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-500 mb-4" />
              <p className="text-slate-400 text-center">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-slate-500 text-sm mt-2">Digite uma busca: cliente, serviço, relatório, configurações...</p>
            </div>
          ) : (
            <div className="overflow-y-auto space-y-6 pr-4">
              {/* Páginas do Sistema */}
              {results.pages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/20">
                    <LayoutDashboard className="h-5 w-5 text-purple-400" />
                    <h3 className="font-bold text-purple-400">⚙️ Menus & Sistemas ({results.pages.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.pages.map((page) => (
                      <Link key={page.id} href={page.href}>
                        <button
                          onClick={() => handleClose()}
                          className="w-full text-left p-3 bg-purple-500/5 hover:bg-purple-500/15 border border-purple-500/20 hover:border-purple-500/50 rounded-lg transition-all flex items-center gap-3"
                        >
                          <page.icon className="h-4 w-4 text-purple-400 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-purple-300">{page.name}</p>
                            <p className="text-xs text-purple-600">{page.description}</p>
                          </div>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientes */}
              {results.clients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-500/20">
                    <Users className="h-5 w-5 text-cyan-400" />
                    <h3 className="font-bold text-cyan-400">👥 Clientes ({results.clients.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.clients.map((client) => (
                      <Link key={client.id} href={`/clients`}>
                        <button
                          onClick={() => handleClose()}
                          className="w-full text-left p-3 bg-cyan-500/5 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg transition-all"
                        >
                          <p className="font-semibold text-cyan-300">{client.name}</p>
                          <p className="text-xs text-cyan-600">{client.phone || client.email || "Sem contato"}</p>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Serviços */}
              {results.services.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/20">
                    <Wrench className="h-5 w-5 text-blue-400" />
                    <h3 className="font-bold text-blue-400">🔧 Serviços ({results.services.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.services.map((service) => (
                      <Link key={service.id} href={`/services/${service.id}`}>
                        <button
                          onClick={() => handleClose()}
                          className="w-full text-left p-3 bg-blue-500/5 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-500/50 rounded-lg transition-all"
                        >
                          <p className="font-semibold text-blue-300">{service.name}</p>
                          <p className="text-xs text-primary">{service.clientName || "Sem cliente"}</p>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Chamados */}
              {results.calls.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-orange-500/20">
                    <Phone className="h-5 w-5 text-orange-400" />
                    <h3 className="font-bold text-orange-400">📞 Chamados ({results.calls.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.calls.map((call) => (
                      <Link key={call.id} href={`/calls/${call.id}`}>
                        <button
                          onClick={() => handleClose()}
                          className="w-full text-left p-3 bg-orange-500/5 hover:bg-orange-500/15 border border-orange-500/20 hover:border-orange-500/50 rounded-lg transition-all"
                        >
                          <p className="font-semibold text-orange-300">#{call.id} - {call.equipment}</p>
                          <p className="text-xs text-orange-600">{call.clientName || "Sem cliente"} • {call.description.substring(0, 50)}...</p>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Transações */}
              {results.transactions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/20">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <h3 className="font-bold text-green-400">💰 Financeiro ({results.transactions.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.transactions.map((trans) => (
                      <Link key={trans.id} href={`/financial`}>
                        <button
                          onClick={() => handleClose()}
                          className="w-full text-left p-3 bg-green-500/5 hover:bg-green-500/15 border border-green-500/20 hover:border-green-500/50 rounded-lg transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-green-300">{trans.clientName || "Sem cliente"}</p>
                              <p className="text-xs text-green-600">{trans.status} • {formatDate(trans.createdAt).split(" ")[0]}</p>
                            </div>
                            <span className={trans.type === "entrada" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                              {trans.type === "entrada" ? "+" : "-"}{formatCurrency(parseFloat(trans.amount.toString()))}
                            </span>
                          </div>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Anotações */}
              {results.notes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/20">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <h3 className="font-bold text-blue-400">📝 Anotações ({results.notes.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {results.notes.map((note) => (
                      <Link key={note.id} href={`/clients`}>
                        <button
                          onClick={() => handleClose()}
                          className="w-full text-left p-3 bg-blue-500/5 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-500/50 rounded-lg transition-all"
                        >
                          <p className="font-semibold text-blue-300">{note.clientName}</p>
                          <p className="text-xs text-primary line-clamp-2">{note.content}</p>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
