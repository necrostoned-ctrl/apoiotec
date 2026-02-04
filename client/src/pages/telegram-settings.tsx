import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Send, CheckCircle, Users } from "lucide-react";

export default function TelegramSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Obter usuário logado do localStorage
  useEffect(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (currentUser.id) {
        setCurrentUserId(currentUser.id);
        setUserName(currentUser.name || currentUser.username || "Usuário");
      }
    } catch (error) {
      console.error("Erro ao obter usuário atual:", error);
    }
  }, []);

  const { data: config, refetch } = useQuery({
    queryKey: ["/api/telegram-config", currentUserId],
    enabled: currentUserId !== null,
    queryFn: async () => {
      const response = await fetch(
        `/api/telegram-config?userId=${currentUserId}`
      );
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Refetch quando userId muda
  useEffect(() => {
    if (currentUserId !== null) {
      refetch();
    }
  }, [currentUserId, refetch]);

  useEffect(() => {
    if (config && config.botToken) {
      setBotToken(config.botToken || "");
      setChatId(config.chatId || "");
      setIsActive(config.isActive ?? true);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/telegram-config", {
        botToken,
        chatId,
        isActive,
        userId: currentUserId,
      });
      if (!response.ok) throw new Error("Erro ao salvar");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/telegram-config", currentUserId] 
      });
      refetch();
      toast({
        title: "Sucesso",
        description: "Configurações do Telegram salvas!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/telegram-test", {
        userId: currentUserId,
      });
      if (!response.ok) throw new Error("Erro ao testar");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Mensagem de teste enviada para o Telegram!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem de teste",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="w-full p-4 lg:p-8 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuração de Notificações Telegram
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure o bot do Telegram para receber notificações de eventos do sistema
        </p>
        <div className="flex items-center gap-2 mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <Users className="h-4 w-4 text-primary dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            Configurando para: <span className="font-bold">{userName}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Configuração */}
        <Card className="bg-background dark:bg-slate-800 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Configurar Telegram</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Bot Token do Telegram
              </label>
              <Input
                type="password"
                placeholder="Digite o token do seu bot"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="bg-background dark:bg-slate-700 border-gray-200 dark:border-slate-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenha em https://t.me/BotFather
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Chat ID
              </label>
              <Input
                placeholder="ID do chat ou grupo"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="bg-background dark:bg-slate-700 border-gray-200 dark:border-slate-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Envie /start para o bot para descobrir seu Chat ID
              </p>
            </div>

            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Ativar Notificações
              </label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex-1 bg-primary hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
              <Button
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending || !botToken || !chatId}
                variant="outline"
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Testar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações e Guia */}
        <Card className="bg-background dark:bg-slate-800 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Como Configurar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Passo 1: Criar um Bot
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Acesse @BotFather no Telegram e crie um novo bot. Ele fornecerá um token.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Passo 2: Iniciar Conversa
              </h3>
              <p className="text-sm text-green-800 dark:text-green-300">
                Envie /start ao seu bot e copie o Chat ID que aparece.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Passo 3: Configurar
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                Cole o token e Chat ID nos campos acima e clique em Salvar.
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Eventos que Geram Notificações:
              </h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>📞 Novo chamado criado</li>
                <li>🔄 Chamado transformado em serviço</li>
                <li>💰 Serviço transformado em financeiro</li>
                <li>✅ Transação marcada como paga</li>
                <li>↩️ Financeiro revertido para serviço</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                📢 Configuração Pessoal
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                Cada usuário do sistema pode configurar seu próprio Chat ID! Todos que tiverem Telegram configurado receberão as notificações de eventos do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
