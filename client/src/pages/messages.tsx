import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMessageSchema, type Message } from "@shared/schema";
import { Plus, Trash2, Edit2, MessageSquare } from "lucide-react";
import { z } from "zod";

const formSchema = insertMessageSchema.extend({
  clientId: z.coerce.number().optional(),
});

type MessageFormData = z.infer<typeof formSchema>;

export default function Messages() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Tema néon
  const categoryColors: Record<string, {border: string; text: string; bg: string}> = {
    cliente: { border: 'border-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    sistema: { border: 'border-green-500', text: 'text-green-400', bg: 'bg-green-500/10' },
    pessoal: { border: 'border-pink-500', text: 'text-pink-400', bg: 'bg-pink-500/10' },
    outros: { border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  };

  const form = useForm<MessageFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "cliente",
      clientId: 0,
    },
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      const response = await apiRequest("POST", "/api/messages", data);
      if (!response.ok) throw new Error("Failed to create message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setIsDialogOpen(false);
      setEditingMessage(null);
      form.reset();
      toast({ title: "✅ Sucesso!", description: "Anotação criada!" });
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MessageFormData }) => {
      const response = await apiRequest("PATCH", `/api/messages/${id}`, data);
      if (!response.ok) throw new Error("Failed to update message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setIsDialogOpen(false);
      setEditingMessage(null);
      form.reset();
      toast({ title: "✅ Sucesso!", description: "Anotação atualizada!" });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/messages/${id}`);
      if (!response.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({ title: "🗑️ Deletado!", description: "Anotação removida!" });
    },
  });

  const onSubmit = (data: MessageFormData) => {
    if (editingMessage) {
      updateMessageMutation.mutate({ id: editingMessage.id, data });
    } else {
      createMessageMutation.mutate(data);
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    form.reset({
      title: message.title,
      content: message.content,
      category: message.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (message: Message) => {
    if (confirm("Tem certeza que deseja excluir esta anotação?")) {
      deleteMessageMutation.mutate(message.id);
    }
  };

  const handleNewNote = () => {
    setEditingMessage(null);
    form.reset({
      title: "",
      content: "",
      category: "cliente",
    });
    setIsDialogOpen(true);
  };

  // Agrupar mensagens por categoria
  const clientMessages = messages.filter(m => m.category === "cliente");
  const metodoMessages = messages.filter(m => m.category === "metodo");
  const outrasMessages = messages.filter(m => !m.category || (m.category !== "cliente" && m.category !== "metodo"));

  const renderMessageCard = (message: Message) => {
    const colors = categoryColors[message.category] || categoryColors.outros;
    return (
      <div
        key={message.id}
        className={`bg-gray-900 rounded-lg p-4 shadow-md hover:shadow-lg transition-all border-2 ${colors.border} ${colors.bg}`}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className={`font-semibold ${colors.text} text-sm line-clamp-2 flex-1`}>
            {message.title}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => handleEdit(message)}
              className="p-1.5 hover:bg-cyan-500/20 rounded text-cyan-400 hover:text-cyan-300"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(message)}
              className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
              title="Deletar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-gray-300 text-sm line-clamp-4">
          {message.content}
        </p>
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-4 text-center text-white">Carregando anotações...</div>;
  }

  return (
    <div className="p-4 lg:p-8 bg-black dark:bg-black min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white dark:text-white flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
              Anotações
            </h1>
            <p className="text-gray-400 dark:text-gray-400 mt-2">
              Organize suas anotações em blocos por categoria
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleNewNote}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nova Anotação</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-900 border-2 border-purple-500 shadow-2xl shadow-purple-500/30">
              <DialogHeader>
                <DialogTitle>
                  {editingMessage ? "✏️ Editar Anotação" : "📝 Nova Anotação"}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o título da anotação..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite o conteúdo da anotação..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cliente">👥 Cliente</SelectItem>
                            <SelectItem value="metodo">🔧 Método</SelectItem>
                            <SelectItem value="outros">📌 Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createMessageMutation.isPending ||
                        updateMessageMutation.isPending
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {editingMessage ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards Grid - 3 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Clientes */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-blue-500">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              👥 Clientes
            </h2>
            <Badge className="ml-auto bg-blue-500">{clientMessages.length}</Badge>
          </div>
          <div className="space-y-3 flex-1">
            {clientMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Nenhuma anotação de clientes</p>
              </div>
            ) : (
              clientMessages.map(renderMessageCard)
            )}
          </div>
        </div>

        {/* Coluna 2: Métodos */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-green-500">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              🔧 Métodos
            </h2>
            <Badge className="ml-auto bg-green-500">{metodoMessages.length}</Badge>
          </div>
          <div className="space-y-3 flex-1">
            {metodoMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Nenhuma anotação de métodos</p>
              </div>
            ) : (
              metodoMessages.map(renderMessageCard)
            )}
          </div>
        </div>

        {/* Coluna 3: Outros */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-purple-500">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              📌 Outros
            </h2>
            <Badge className="ml-auto bg-purple-500">{outrasMessages.length}</Badge>
          </div>
          <div className="space-y-3 flex-1">
            {outrasMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Nenhuma anotação</p>
              </div>
            ) : (
              outrasMessages.map(renderMessageCard)
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="col-span-full text-center py-16">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Nenhuma anotação criada
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Clique em "Nova Anotação" para começar a organizar seus blocos
          </p>
        </div>
      )}
    </div>
  );
}
