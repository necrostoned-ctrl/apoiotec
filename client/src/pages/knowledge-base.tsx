import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Edit, Trash2, BookOpen, ThumbsUp, Filter, Eye, Copy } from "lucide-react";
import { insertKnowledgeBaseSchema, type KnowledgeBase } from "@shared/schema";

const knowledgeFormSchema = insertKnowledgeBaseSchema;
type FormData = z.infer<typeof knowledgeFormSchema>;

export default function KnowledgeBase({ currentUser }: { currentUser?: any }) {
  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeBase | null>(null);
  const [viewingArticle, setViewingArticle] = useState<KnowledgeBase | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/knowledge-base"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: {
      title: "",
      category: "software",
      problem: "",
      solution: "",
      keywords: "",
      userId: loggedUser?.id || 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/knowledge-base", {
        ...data,
        userId: loggedUser?.id || 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Sucesso", description: "Artigo criado!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiRequest("PATCH", `/api/knowledge-base/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      setIsDialogOpen(false);
      setEditingArticle(null);
      form.reset();
      toast({ title: "Sucesso", description: "Artigo atualizado!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/knowledge-base/${id}`);
      if (!response.ok) throw new Error("Erro ao deletar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({ title: "Sucesso", description: "Artigo deletado!" });
    },
  });

  const filteredArticles = articles.filter(
    (article) =>
      (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.problem.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!categoryFilter || article.category === categoryFilter)
  );

  const onSubmit = (data: FormData) => {
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6 pb-32">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-orange-400 mb-2">Base de Conhecimento</h2>
          <p className="text-gray-400">Solução de problemas e documentação técnica</p>
        </div>
        <Button 
          onClick={() => { setEditingArticle(null); form.reset(); setIsDialogOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Artigo
        </Button>
      </div>

      <Card className="mb-6 bg-white dark:bg-slate-800 border-0 shadow-md">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros
              <span className={`text-sm transition-transform ${showFilters ? 'rotate-180' : ''}`}>⬇️</span>
            </CardTitle>
          </div>
        </CardHeader>
        {showFilters && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Buscar Artigos</label>
              <Input
                placeholder="Por título ou problema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="rede">Rede</SelectItem>
                  <SelectItem value="impressora">Impressora</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        )}
      </Card>

      {isLoading ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : filteredArticles.length === 0 ? (
        <Card className="bg-black border-4 border-orange-500">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum artigo encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="bg-black border-4 border-orange-500 flex flex-col h-full">
              <CardContent className="p-0 flex flex-col flex-1">
                <div className="p-4 space-y-3 flex-1">
                  <div>
                    <CardTitle className="text-lg line-clamp-2 text-orange-400">{article.title}</CardTitle>
                    <p className="text-xs text-gray-400 mt-1">{article.category}</p>
                  </div>

                  <div className="bg-gray-800 p-3 rounded border border-orange-500/30">
                    <p className="text-sm font-semibold mb-1 text-orange-400">Problema:</p>
                    <p className="text-sm text-gray-300 line-clamp-2">{article.problem}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">{article.helpful}</span>
                    </div>
                    <span className="text-gray-500">{article.views} visualizações</span>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-orange-500/30 mt-auto">
                  <div className="grid grid-cols-4 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setViewingArticle(article);
                        setIsViewDialogOpen(true);
                      }}
                      className="h-8 text-xs flex flex-col items-center justify-center p-1"
                      title="Visualizar Detalhes"
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingArticle(article);
                        form.reset({
                          title: article.title,
                          category: article.category,
                          problem: article.problem,
                          solution: article.solution,
                          keywords: article.keywords || "",
                          tags: article.tags || "",
                        });
                        setIsDialogOpen(true);
                      }}
                      className="h-8 text-xs flex flex-col items-center justify-center p-1"
                      title="Editar"
                    >
                      <Edit className="h-3.5 w-3.5 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(article.solution);
                        alert("Solução copiada!");
                      }}
                      className="h-8 text-xs flex flex-col items-center justify-center p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      title="Copiar Solução"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Deletar este artigo?")) {
                          deleteMutation.mutate(article.id);
                        }
                      }}
                      className="h-8 text-xs flex flex-col items-center justify-center p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Deletar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-violet-500 shadow-2xl shadow-violet-500/30">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Editar Artigo" : "Novo Artigo"}</DialogTitle>
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
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="rede">Rede</SelectItem>
                        <SelectItem value="impressora">Impressora</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problema</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Descrição do problema" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="solution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solução</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Passo a passo da solução" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-gray-700 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingArticle ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{viewingArticle?.title}</DialogTitle>
          </DialogHeader>
          {viewingArticle && (
            <div className="space-y-6 py-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Categoria</p>
                <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm capitalize">
                  {viewingArticle.category}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Visualizações</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{viewingArticle.views}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Útil</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{viewingArticle.helpful}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Problema</p>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border-l-4 border-blue-600">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">{viewingArticle.problem}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Solução</p>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border-l-4 border-green-600">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">{viewingArticle.solution}</p>
                </div>
              </div>

              {viewingArticle.keywords && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Palavras-chave</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingArticle.keywords.split(",").map((keyword, idx) => (
                      <span key={idx} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)} 
                  className="text-gray-700 dark:text-gray-300"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
