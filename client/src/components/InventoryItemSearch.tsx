import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, X } from "lucide-react";
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

interface InventoryItem {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  type: "product" | "service";
}

interface InventoryItemSearchProps {
  onSelect: (item: InventoryItem) => void;
  placeholder?: string;
  className?: string;
}

export function InventoryItemSearch({ 
  onSelect, 
  placeholder = "Buscar produto ou serviço...",
  className = ""
}: InventoryItemSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory/products"],
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory/services"],
  });

  // Combinar produtos e serviços
  const allItems: InventoryItem[] = [
    ...products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      quantity: p.quantity,
      type: "product" as const
    })),
    ...services.map((s: any) => ({
      id: s.id,
      name: s.name,
      price: parseFloat(s.price),
      quantity: 999,
      type: "service" as const
    }))
  ];

  // Filtrar itens baseado na busca
  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    onSelect(item);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    setSelectedItem(null);
    setSearchValue("");
  };

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
              setOpen(!open);
            }}
          >
            {selectedItem ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {selectedItem.type === "product" ? (
                    <Package className="h-4 w-4 text-gray-500" />
                  ) : (
                    <div className="h-4 w-4 text-gray-500">🔧</div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{selectedItem.name}</span>
                    <span className="text-xs text-gray-500">
                      R$ {selectedItem.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedItem.type === "product" ? "Produto" : "Serviço"}
                  </Badge>
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
              className="text-base"
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">Nenhum item encontrado</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tente buscar por nome
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    value={item.name}
                    onSelect={() => {
                      handleSelect(item);
                    }}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {item.type === "product" ? (
                          <Package className="h-4 w-4 text-gray-500" />
                        ) : (
                          <div className="h-4 w-4 text-gray-500">🔧</div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>R$ {item.price.toFixed(2)}</span>
                            {item.type === "product" && item.quantity !== undefined && (
                              <span>• {item.quantity} un.</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary"
                        className="text-xs"
                      >
                        {item.type === "product" ? "Produto" : "Serviço"}
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
