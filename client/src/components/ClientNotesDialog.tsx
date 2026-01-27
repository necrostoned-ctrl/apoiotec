import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, Plus, Edit2, Trash2, Calendar, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ClientNote } from "@shared/schema";

interface ClientNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number;
  clientName: string;
}

export function ClientNotesDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
}: ClientNotesDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newContent, setNewContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery<ClientNote[]>({
    queryKey: ["/api/clients", clientId, "notes"],
    enabled: open,
    queryFn: async () => {
      const response = await fetch(
        `/api/clients/${clientId}/notes`
      );
      if (!response.ok) throw new Error("Erro ao buscar notas");
      return response.json();
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/clients/${clientId}/notes`, {
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/clients", clientId, "notes"],
      });
      setNewContent("");
      setIsCreating(false);
      toast({
        title: "Sucesso",
        description: "Nota criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar nota. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const response = await apiRequest("PUT", `/api/clients/notes/${id}`, {
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/clients", clientId, "notes"],
      });
      setEditingId(null);
      setNewContent("");
      toast({
        title: "Sucesso",
        description: "Nota atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar nota. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/clients/notes/${id}`);
      if (!response.ok) throw new Error("Erro ao deletar nota");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/clients", clientId, "notes"],
      });
      toast({
        title: "Sucesso",
        description: "Nota removida com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover nota. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateNote = () => {
    if (!newContent.trim()) {
      toast({
        title: "Erro",
        description: "A nota não pode estar vazia",
        variant: "destructive",
      });
      return;
    }
    createNoteMutation.mutate(newContent);
  };

  const handleUpdateNote = (id: number, content: string) => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "A nota não pode estar vazia",
        variant: "destructive",
      });
      return;
    }
    updateNoteMutation.mutate({ id, content });
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta nota?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border-2 border-green-500 shadow-2xl shadow-green-500/30">
        <DialogHeader className="border-b-2 border-green-500 pb-3">
          <DialogTitle className="flex items-center gap-2 text-white text-xl">
            <BookOpen className="h-5 w-5 text-green-400" />
            Notas - {clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-4">
          {/* Form para criar nova nota */}
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              className="w-full"
              data-testid="button-create-note"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota
            </Button>
          )}

          {isCreating && (
            <Card className="p-4 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nova Anotação
                </label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Digite aqui sua nota..."
                  className="min-h-32 resize-none"
                  data-testid="textarea-new-note"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewContent("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateNote}
                    disabled={createNoteMutation.isPending || !newContent.trim()}
                  >
                    {createNoteMutation.isPending ? "Criando..." : "Criar Nota"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Lista de notas */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando notas...
            </div>
          ) : notes.length === 0 && !isCreating ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma nota criada ainda. Clique em "Nova Nota" para começar!
            </div>
          ) : (
            notes.map((note) => (
              <Card
                key={note.id}
                className="p-4 border-2 border-purple-500 dark:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50 shadow-lg dark:shadow-purple-500/20 dark:bg-slate-800"
                data-testid={`card-note-${note.id}`}
              >
                {editingId === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="min-h-32 resize-none"
                      data-testid={`textarea-edit-note-${note.id}`}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setNewContent("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => handleUpdateNote(note.id, newContent)}
                        disabled={updateNoteMutation.isPending}
                      >
                        {updateNoteMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.createdAt)}
                        {note.updatedAt && note.updatedAt !== note.createdAt && (
                          <span className="ml-2">(editado em {formatDate(note.updatedAt)})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // View note
                          }}
                          className="h-8 w-8 p-0"
                          title="Visualizar nota"
                        >
                          <Eye className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(note.id);
                            setNewContent(note.content);
                          }}
                          className="h-8 w-8 p-0"
                          title="Editar nota"
                          data-testid={`button-edit-note-${note.id}`}
                        >
                          <Edit2 className="h-4 w-4 text-amber-400 dark:text-amber-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-8 w-8 p-0"
                          title="Deletar nota"
                          data-testid={`button-delete-note-${note.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
