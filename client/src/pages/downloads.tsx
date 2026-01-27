import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Link as LinkIcon, Plus, ExternalLink, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertDownloadLinkSchema, type DownloadLink } from "@shared/schema";
import { z } from "zod";

const formSchema = insertDownloadLinkSchema;
type FormData = z.infer<typeof formSchema>;

export default function Downloads() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "system",
      description: "",
    },
  });

  const { data: links = [], isLoading } = useQuery<DownloadLink[]>({
    queryKey: ["/api/download-links"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/download-links", data);
      if (!response.ok) throw new Error("Erro ao criar link");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/download-links"] });
      setIsOpen(false);
      form.reset();
      toast({ title: "✅ Link adicionado!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/download-links/${id}`);
      if (!response.ok) throw new Error("Erro ao deletar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/download-links"] });
      toast({ title: "🗑️ Link removido!" });
    },
  });

  const systemLinks = links.filter(l => l.type === "system");
  const usefulLinks = links.filter(l => l.type === "useful");

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-black dark:bg-black">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 dark:text-white">Downloads</h2>
          <p className="text-gray-400 dark:text-gray-400">Links de arquivos e recursos</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-2 border-cyan-500 dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-cyan-400">Adicionar Novo Link</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Título</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" className="bg-gray-800 border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tipo</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="system">📦 Sistema</SelectItem>
                          <SelectItem value="useful">🔗 Links Úteis</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} className="bg-gray-800 border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createMutation.isPending} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
                  {createMutation.isPending ? "Salvando..." : "Salvar Link"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arquivos de Sistema */}
        <Card className="bg-gray-900 border-2 border-green-500 dark:bg-gray-900 shadow-lg shadow-green-500/20">
          <CardHeader className="border-b-2 border-green-500">
            <CardTitle className="flex items-center text-green-400">
              <Download className="h-5 w-5 mr-2" />
              📦 Arquivos de Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {systemLinks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhum arquivo disponível</p>
              </div>
            ) : (
              <div className="space-y-3">
                {systemLinks.map(link => (
                  <div key={link.id} className="p-3 bg-gray-800 border border-green-500/30 rounded-lg hover:border-green-500 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-green-400 font-semibold hover:text-green-300 flex items-center gap-2">
                          {link.title}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        {link.description && <p className="text-sm text-gray-400 mt-1">{link.description}</p>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(link.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links Úteis */}
        <Card className="bg-gray-900 border-2 border-cyan-500 dark:bg-gray-900 shadow-lg shadow-cyan-500/20">
          <CardHeader className="border-b-2 border-cyan-500">
            <CardTitle className="flex items-center text-cyan-400">
              <LinkIcon className="h-5 w-5 mr-2" />
              🔗 Links Úteis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {usefulLinks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhum link cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usefulLinks.map(link => (
                  <div key={link.id} className="p-3 bg-gray-800 border border-cyan-500/30 rounded-lg hover:border-cyan-500 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-semibold hover:text-cyan-300 flex items-center gap-2">
                          {link.title}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        {link.description && <p className="text-sm text-gray-400 mt-1">{link.description}</p>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(link.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
