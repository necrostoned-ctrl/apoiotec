import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Edit, Plus, Eye, Trash } from "lucide-react";

interface Template {
  id: number;
  name: string;
  type: string;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  content: string;
  primary_color?: string;
  font_size?: string;
}

interface TemplatesProps {
  currentUser?: any;
}

export default function Templates({ currentUser }: TemplatesProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "recibo",
    company_name: "APOIOTEC INFORMÁTICA",
    company_cnpj: "00.000.000/0001-00",
    company_address: "Rua da Tecnologia, 123 - Centro - São Paulo/SP",
    company_phone: "(11) 99999-9999",
    company_email: "contato@apoiotec.com.br",
    content: `<div class="company-header">
  <h1>{{empresa_nome}}</h1>
  <p>CNPJ: {{empresa_cnpj}}</p>
  <p>{{empresa_endereco}}</p>
  <p>Tel: {{empresa_telefone}} | Email: {{empresa_email}}</p>
</div>

<div class="document-title">
  <h2>DOCUMENTO</h2>
  <p>Data: {{dataAtual}}</p>
</div>

<div class="client-info">
  <h3>CLIENTE:</h3>
  <p>{{cliente_nome}}</p>
  <p>{{cliente_telefone}}</p>
</div>

<div class="service-info">
  <h3>SERVIÇO:</h3>
  <p>{{descricao}}</p>
</div>

<div class="value-info">
  <h3>VALOR: R$ {{valor}}</h3>
</div>`,
    primary_color: "#0066cc",
    font_size: "14"
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao criar template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Sucesso", description: "Template criado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao criar template",
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/templates/${editingTemplate?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao atualizar template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      toast({ title: "Sucesso", description: "Template atualizado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao atualizar template",
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({ title: "Sucesso", description: "Template removido com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao deletar template",
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "recibo",
      company_name: "APOIOTEC INFORMÁTICA",
      company_cnpj: "00.000.000/0001-00",
      company_address: "Rua da Tecnologia, 123 - Centro - São Paulo/SP",
      company_phone: "(11) 99999-9999",
      company_email: "contato@apoiotec.com.br",
      content: `<div class="company-header">
  <h1>{{empresa_nome}}</h1>
  <p>CNPJ: {{empresa_cnpj}}</p>
  <p>{{empresa_endereco}}</p>
  <p>Tel: {{empresa_telefone}} | Email: {{empresa_email}}</p>
</div>

<div class="document-title">
  <h2>DOCUMENTO</h2>
  <p>Data: {{dataAtual}}</p>
</div>

<div class="client-info">
  <h3>CLIENTE:</h3>
  <p>{{cliente_nome}}</p>
  <p>{{cliente_telefone}}</p>
</div>

<div class="service-info">
  <h3>SERVIÇO:</h3>
  <p>{{descricao}}</p>
</div>

<div class="value-info">
  <h3>VALOR: R$ {{valor}}</h3>
</div>`,
      primary_color: "#0066cc",
      font_size: "14"
    });
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      company_name: template.company_name || "APOIOTEC INFORMÁTICA",
      company_cnpj: "00.000.000/0001-00",
      company_address: template.company_address || "Endereço não informado",
      company_phone: template.company_phone || "Telefone não informado",
      company_email: template.company_email || "Email não informado",
      content: template.content,
      primary_color: template.primary_color || "#0066cc",
      font_size: template.font_size || "14"
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "Nome do template é obrigatório", variant: "destructive" });
      return;
    }

    const templateData = {
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingTemplate) {
      updateMutation.mutate(templateData);
    } else {
      createMutation.mutate(templateData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div>Carregando templates...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Templates</h2>
          <p className="text-gray-600 dark:text-gray-300">Gerencie os templates para documentos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingTemplate(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/30">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Template" : "Novo Template"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Recibo, Orçamento, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recibo">Recibo</SelectItem>
                      <SelectItem value="orcamento">Orçamento</SelectItem>
                      <SelectItem value="nota_servico">Nota de Serviço</SelectItem>
                      <SelectItem value="relatorio">Relatório</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company_email">Email da Empresa</Label>
                  <Input
                    id="company_email"
                    value={formData.company_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_phone">Telefone da Empresa</Label>
                  <Input
                    id="company_phone"
                    value={formData.company_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company_address">Endereço da Empresa</Label>
                  <Input
                    id="company_address"
                    value={formData.company_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold">Informações da Empresa</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Configure os dados da sua empresa que aparecerão nos documentos</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nome da Empresa</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                        placeholder="APOIOTEC INFORMÁTICA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_cnpj">CNPJ</Label>
                      <Input
                        id="company_cnpj"
                        value={formData.company_cnpj || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_cnpj: e.target.value }))}
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_address">Endereço Completo</Label>
                      <Input
                        id="company_address"
                        value={formData.company_address || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
                        placeholder="Rua, número, bairro, cidade - CEP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_phone">Telefone</Label>
                      <Input
                        id="company_phone"
                        value={formData.company_phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_phone: e.target.value }))}
                        placeholder="(00) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_email">Email</Label>
                      <Input
                        id="company_email"
                        value={formData.company_email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_email: e.target.value }))}
                        placeholder="contato@apoiotec.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label htmlFor="content" className="text-base font-medium">Layout Personalizado (Opcional)</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">O sistema usa um layout profissional automático. Deixe em branco para usar o padrão.</p>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    placeholder="Deixe vazio para usar o layout padrão profissional..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTemplate ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: Template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{template.name}</span>
                <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  {template.type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Empresa:</strong> {template.company_name || "Não informado"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Email:</strong> {template.company_email || "Não informado"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDelete(template.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nenhum template encontrado. Crie seu primeiro template!
          </p>
        </div>
      )}
    </div>
  );
}