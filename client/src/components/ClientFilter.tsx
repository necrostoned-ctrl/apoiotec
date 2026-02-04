import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Client } from "@shared/schema";

interface ClientFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showClearAll?: boolean;
}

export function ClientFilter({ 
  value, 
  onChange, 
  placeholder = "Filtrar por cliente...",
  className = "",
  showClearAll = true
}: ClientFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Filtrar apenas clientes ativos com proteção
  const activeClients = (clients || []).filter(client => 
    client && client.id && client.name && client.status === 'ativo'
  );

  // Filtrar clientes baseado na busca
  const filteredClients = activeClients.filter(client => {
    try {
      if (!client || !client.name) return false;
      
      const searchLower = searchValue.toLowerCase();
      const nameMatch = client.name.toLowerCase().includes(searchLower);
      const phoneMatch = client.phone && client.phone.includes(searchValue);
      const emailMatch = client.email && client.email.toLowerCase().includes(searchLower);
      
      return nameMatch || phoneMatch || emailMatch;
    } catch (error) {
      console.error("Erro ao filtrar cliente:", error, client);
      return false;
    }
  });

  // Encontrar cliente selecionado quando value muda
  useEffect(() => {
    try {
      if (value && value !== "" && value !== "todos") {
        const client = activeClients.find(c => c && c.id && c.id.toString() === value.toString());
        setSelectedClient(client || null);
      } else {
        setSelectedClient(null);
      }
    } catch (error) {
      console.error("Erro ao encontrar cliente:", error);
      setSelectedClient(null);
    }
  }, [value, activeClients]);

  const handleSelect = (client: Client) => {
    try {
      if (client && client.id) {
        console.log("✅ [CLIENT-SELECT] Cliente selecionado:", { id: client.id, name: client.name });
        setSelectedClient(client);
        onChange(client.id.toString());
        setOpen(false);
        setSearchValue("");
      } else {
        console.error("❌ [CLIENT-INVALID]", client);
      }
    } catch (error) {
      console.error("❌ [CLIENT-SELECT-ERROR]", error);
    }
  };

  const handleClear = () => {
    console.log("🟡 [CLIENT-CLEAR] Limpando seleção");
    setSelectedClient(null);
    onChange("");
    setSearchValue("");
  };

  const handleClearAll = () => {
    console.log("🟡 [CLIENT-CLEAR-ALL] Limpando tudo (todos)");
    setSelectedClient(null);
    onChange("todos");
    setSearchValue("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start text-left font-normal h-auto min-h-[44px] p-3"
                onClick={() => setOpen(!open)}
              >
                {selectedClient ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">{selectedClient.name}</span>
                        {selectedClient.phone && (
                          <span className="text-xs text-gray-500">{selectedClient.phone}</span>
                        )}
                      </div>
                    </div>
                    <Button
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
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Search className="h-4 w-4" />
                    <span>{placeholder}</span>
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50" align="start" sideOffset={4}>
              <Command>
                <CommandInput
                  placeholder="Digite para buscar..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                  className="text-base"
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">Nenhum cliente encontrado</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tente buscar por nome, telefone ou email
                      </p>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.name}
                        onSelect={() => handleSelect(client)}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div className="flex flex-col">
                              <span className="font-medium">{client.name}</span>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {client.phone && <span>{client.phone}</span>}
                                {client.email && <span>{client.email}</span>}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={client.status === 'ativo' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {client.status}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Botão "Todos os clientes" */}
        {showClearAll && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="px-3 whitespace-nowrap"
          >
            <User className="h-4 w-4 mr-1" />
            Todos
          </Button>
        )}
      </div>

      {/* Indicador de cliente selecionado */}
      {selectedClient && (
        <div className="text-xs text-primary mt-1 px-1">
          Filtrando por: {selectedClient.name}
        </div>
      )}
    </div>
  );
}