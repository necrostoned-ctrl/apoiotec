import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Client } from "@shared/schema";

interface MobileClientSearchProps {
  value?: number | null;
  onSelect: (clientId: number | null, client: Client) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
}

export function MobileClientSearch({ 
  value, 
  onSelect, 
  placeholder = "Buscar cliente...",
  className = "",
  allowEmpty = false
}: MobileClientSearchProps) {
  console.log('MobileClientSearch renderizado com value:', value);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });
  
  console.log('MobileClientSearch - clientes carregados:', clients.length);

  // Filtrar apenas clientes ativos
  const activeClients = clients.filter(client => client.status === 'ativo');

  // Filtrar clientes baseado na busca
  const filteredClients = activeClients.filter(client =>
    client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    (client.phone && client.phone.includes(searchValue)) ||
    (client.email && client.email.toLowerCase().includes(searchValue.toLowerCase()))
  );

  // Encontrar cliente selecionado quando value muda
  useEffect(() => {
    if (value) {
      const client = activeClients.find(c => c.id === value);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [value, activeClients]);

  const handleSelect = (client: Client) => {
    console.log('MobileClientSearch - Cliente selecionado:', client);
    setSelectedClient(client);
    onSelect(client.id, client);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    setSelectedClient(null);
    if (allowEmpty) {
      onSelect(null, {} as Client);
    }
    setSearchValue("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Client Display / Search Trigger */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start text-left font-normal h-auto min-h-[44px] p-3 touch-manipulation"
        onClick={() => {
          console.log('MobileClientSearch - Botão clicado, open:', !open);
          setOpen(!open);
        }}
      >
        {selectedClient ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{selectedClient.name}</span>
                {selectedClient.phone && (
                  <span className="text-xs text-gray-500">{selectedClient.phone}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {selectedClient.status}
              </Badge>
              {allowEmpty && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-gray-500">
              <Search className="h-4 w-4" />
              <span className="text-sm">{placeholder}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </Button>

      {/* Mobile-optimized dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden" 
            onClick={() => setOpen(false)}
          />
          
          {/* Dropdown content */}
          <Card className="absolute top-full left-0 right-0 mt-2 p-0 z-50 max-h-80 overflow-hidden shadow-lg">
            {/* Search input */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite para buscar..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 text-base border-0 focus:ring-0 focus:border-0 h-11"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-60 overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">Nenhum cliente encontrado</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tente buscar por nome, telefone ou email
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      className="w-full p-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      onClick={() => handleSelect(client)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">{client.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              {client.phone && <span>{client.phone}</span>}
                              {client.email && <span className="truncate">{client.email}</span>}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={client.status === 'ativo' ? 'default' : 'secondary'} 
                          className="text-xs flex-shrink-0"
                        >
                          {client.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}