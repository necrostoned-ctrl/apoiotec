import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { MobileClientSearch } from "./MobileClientSearch";

interface ClientSearchProps {
  value?: number | null;
  onSelect: (clientId: number | null, client: Client) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
}

export function ClientSearch({ 
  value, 
  onSelect, 
  placeholder = "Buscar cliente...",
  className = "",
  allowEmpty = false
}: ClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // SEMPRE usar versão desktop como solicitado pelo usuário
  useEffect(() => {
    setIsMobile(false); // Forçar sempre desktop
  }, []);

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
    setSelectedClient(client);
    onSelect(client.id, client);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    setSelectedClient(null);
    if (allowEmpty) {
      onSelect(null, {} as Client); // Para campos opcionais, permite null
    }
    setSearchValue("");
  };

  // Usar componente mobile em dispositivos touch
  if (isMobile) {
    return (
      <MobileClientSearch
        value={value}
        onSelect={onSelect}
        placeholder={placeholder}
        className={className}
        allowEmpty={allowEmpty}
      />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-left font-normal h-auto min-h-[44px] p-3"
            onClick={() => {
              console.log('ClientSearch desktop - Botão clicado');
              setOpen(!open);
            }}
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedClient.status}
                  </Badge>
                  {allowEmpty && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
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
              className="text-base" // Evita zoom no iOS
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
                    onSelect={() => {
                      console.log('ClientSearch desktop - Item selecionado:', client.name);
                      handleSelect(client);
                    }}
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
  );
}