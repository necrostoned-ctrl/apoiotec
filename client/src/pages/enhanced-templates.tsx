import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, FileText, Receipt, Calculator, Clipboard, Palette, Settings, Image, Type, Layout, Wand2 } from "lucide-react";
import type { Template, InsertTemplate } from "../../../shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function EnhancedTemplatesPage() {
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template & {
    fontSize?: string;
    titleFontSize?: string;
    headerAlignment?: string;
    contentAlignment?: string;
    logoSize?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    lineHeight?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    borderColor?: string;
    borderWidth?: string;
    backgroundColor?: string;
  }> | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/templates'],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: InsertTemplate) => {
      const response = await fetch('/api/templates', {
        method: 'POST',
        body: JSON.stringify(template),
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...template }: { id: number } & InsertTemplate) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(template),
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recibo': return Receipt;
      case 'orcamento': return Calculator;
      case 'relatorio': return Clipboard;
      case 'nota_servico': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recibo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'orcamento': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'relatorio': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'nota_servico': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'recibo': return 'Recibo';
      case 'orcamento': return 'Orçamento';
      case 'relatorio': return 'Relatório';
      case 'nota_servico': return 'Nota de Serviço';
      default: return type;
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate({
      ...template,
      fontSize: template.fontSize || '14px',
      titleFontSize: template.titleFontSize || '28px',
      headerAlignment: template.headerAlignment || 'center',
      contentAlignment: template.contentAlignment || 'left',
      logoSize: template.logoSize || '180px',
      primaryColor: template.primaryColor || '#007bff',
      secondaryColor: template.secondaryColor || '#6c757d',
      fontFamily: template.fontFamily || 'Arial, sans-serif',
      lineHeight: template.lineHeight || '1.6',
      marginTop: template.marginTop || '25px',
      marginBottom: template.marginBottom || '25px',
      marginLeft: template.marginLeft || '25px',
      marginRight: template.marginRight || '25px',
      borderColor: template.borderColor || '#007bff',
      borderWidth: template.borderWidth || '2px',
      backgroundColor: template.backgroundColor || '#ffffff'
    });
    setShowDialog(true);
  };

  const handleNew = () => {
    setEditingTemplate({
      name: '',
      type: 'recibo',
      content: '',
      headerContent: '',
      footerContent: '',
      companyName: 'Apoiotec Informática',
      companyAddress: 'Rua da Tecnologia, 123, Centro',
      companyPhone: '(11) 99999-9999',
      companyEmail: 'contato@apoiotec.com.br',
      logoUrl: '',
      isDefault: false,
      customCss: '',
      fontSize: '14px',
      titleFontSize: '28px',
      headerAlignment: 'center',
      contentAlignment: 'left',
      logoSize: '180px',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      marginTop: '25px',
      marginBottom: '25px',
      marginLeft: '25px',
      marginRight: '25px',
      borderColor: '#007bff',
      borderWidth: '2px',
      backgroundColor: '#ffffff'
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    try {
      const templateData = {
        name:  editingTemplate.name || '',
        type: editingTemplate.type as 'recibo' | 'orcamento' | 'relatorio' | 'nota_servico',
        content: editingTemplate.content || '',
        headerContent: editingTemplate.headerContent || '',
        footerContent: editingTemplate.footerContent || '',
        companyName: editingTemplate.companyName || '',
        companyAddress: editingTemplate.companyAddress || '',
        companyPhone: editingTemplate.companyPhone || '',
        companyEmail: editingTemplate.companyEmail || '',
        logoUrl: editingTemplate.logoUrl || '',
        isDefault: editingTemplate.isDefault || false,
        customCss: editingTemplate.customCss || '',
        fontSize: editingTemplate.fontSize || '14px',
        titleFontSize: editingTemplate.titleFontSize || '28px',
        headerAlignment: editingTemplate.headerAlignment || 'center',
        contentAlignment: editingTemplate.contentAlignment || 'left',
        logoSize: editingTemplate.logoSize || '180px',
        primaryColor: editingTemplate.primaryColor || '#007bff',
        secondaryColor: editingTemplate.secondaryColor || '#6c757d',
        fontFamily: editingTemplate.fontFamily || 'Arial, sans-serif',
        lineHeight: editingTemplate.lineHeight || '1.6',
        marginTop: editingTemplate.marginTop || '25px',
        marginBottom: editingTemplate.marginBottom || '25px',
        marginLeft: editingTemplate.marginLeft || '25px',
        marginRight: editingTemplate.marginRight || '25px',
        borderColor: editingTemplate.borderColor || '#007bff',
        borderWidth: editingTemplate.borderWidth || '2px',
        backgroundColor: editingTemplate.backgroundColor || '#ffffff'
      };

      if (editingTemplate.id) {
        await updateTemplateMutation.mutateAsync({
          id: editingTemplate.id,
          ...templateData,
        });
        toast({ title: "Template atualizado com sucesso!" });
      } else {
        await createTemplateMutation.mutateAsync(templateData);
        toast({ title: "Template criado com sucesso!" });
      }
      
      setEditingTemplate(null);
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({ 
        title: "Erro ao salvar template", 
        description: "Verifique os dados e tente novamente.",
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplateMutation.mutateAsync(id);
      toast({ title: "Template excluído com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro ao excluir template",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    }
  };

  const previewTemplate = (template: Template) => {
    const sampleData = {
      id: '123',
      cliente_nome: 'João Silva',
      cliente_email: 'joao@email.com',
      cliente_telefone: '(11) 99999-9999',
      descricao: 'Manutenção preventiva em computador',
      valor: '150,00',
      data: new Date().toLocaleDateString('pt-BR'),
      data_inicio: new Date().toLocaleDateString('pt-BR'),
      data_conclusao: new Date().toLocaleDateString('pt-BR'),
      tecnico: 'Marcelo',
      empresa_nome: template.companyName || 'Apoiotec Informática',
      empresa_endereco: template.companyAddress || 'Rua da Tecnologia, 123',
      empresa_telefone: template.companyPhone || '(11) 99999-9999',
      empresa_email: template.companyEmail || 'contato@apoiotec.com.br',
      resolucao: 'Problema resolvido com sucesso',
      validade: '30',
      data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      periodo: 'Janeiro 2025',
      receita_total: '5.250,00',
      total_atendimentos: '15',
      ticket_medio: '350,00',
      servicos_concluidos: '12',
      servicos_pendentes: '3',
      maior_faturamento: '850,00'
    };

    let content = template.content || "";
    Object.entries(sampleData).forEach(([key, value]) => {
      const patterns = [
        new RegExp(`{{\\s*${key}\\s*}}`, 'gi'),
        new RegExp(`\\{\\{${key}\\}\\}`, 'gi')
      ];
      patterns.forEach(pattern => {
        content = content.replace(pattern, String(value));
      });
    });

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview - ${template.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .template-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border: 2px solid #007bff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="template-container">
          ${content}
        </div>
      </body>
      </html>
    `;

    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates Profissionais</h1>
          <p className="text-muted-foreground">
            Crie e personalize templates para documentos com design profissional
          </p>
        </div>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(templates as Template[]).map((template: Template) => {
          const IconComponent = getTypeIcon(template.type);
          return (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={`text-xs ${getTypeColor(template.type)}`}>
                        {getTypeName(template.type)}
                      </Badge>
                    </div>
                  </div>
                  {template.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Padrão
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-4 line-clamp-2">
                  {template.companyName} • Personalização avançada com cores e fontes
                </CardDescription>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => previewTemplate(template)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-2 border-yellow-500">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o template "{template.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              {editingTemplate?.id ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Configure todos os aspectos visuais do seu template profissional
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger value="design" className="flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-1">
                  <Layout className="h-3 w-3" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  Imagens
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Template</Label>
                      <Input
                        id="name"
                        value={editingTemplate.name || ''}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          name: e.target.value
                        })}
                        placeholder="Ex: Recibo Padrão"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={editingTemplate.type}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          type: value as any
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recibo">Recibo</SelectItem>
                          <SelectItem value="orcamento">Orçamento</SelectItem>
                          <SelectItem value="relatorio">Relatório</SelectItem>
                          <SelectItem value="nota_servico">Nota de Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input
                        id="companyName"
                        value={editingTemplate.companyName || ''}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          companyName: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail">E-mail da Empresa</Label>
                      <Input
                        id="companyEmail"
                        value={editingTemplate.companyEmail || ''}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          companyEmail: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyPhone">Telefone da Empresa</Label>
                      <Input
                        id="companyPhone"
                        value={editingTemplate.companyPhone || ''}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          companyPhone: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyAddress">Endereço da Empresa</Label>
                      <Input
                        id="companyAddress"
                        value={editingTemplate.companyAddress || ''}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          companyAddress: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={editingTemplate.isDefault || false}
                      onCheckedChange={(checked) => setEditingTemplate({
                        ...editingTemplate,
                        isDefault: checked
                      })}
                    />
                    <Label htmlFor="isDefault">Definir como template padrão</Label>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="headerContent">Cabeçalho</Label>
                    <Textarea
                      id="headerContent"
                      value={editingTemplate.headerContent || ''}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        headerContent: e.target.value
                      })}
                      rows={3}
                      placeholder="HTML do cabeçalho..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Conteúdo Principal</Label>
                    <Textarea
                      id="content"
                      value={editingTemplate.content || ''}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        content: e.target.value
                      })}
                      rows={8}
                      placeholder="HTML do conteúdo principal..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="footerContent">Rodapé</Label>
                    <Textarea
                      id="footerContent"
                      value={editingTemplate.footerContent || ''}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        footerContent: e.target.value
                      })}
                      rows={3}
                      placeholder="HTML do rodapé..."
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Variáveis Disponíveis:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <code>{"{cliente_nome}"}</code>
                      <code>{"{cliente_email}"}</code>
                      <code>{"{cliente_telefone}"}</code>
                      <code>{"{descricao}"}</code>
                      <code>{"{valor}"}</code>
                      <code>{"{data}"}</code>
                      <code>{"{id}"}</code>
                      <code>{"{empresa_nome}"}</code>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Cor Primária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={editingTemplate.primaryColor || '#007bff'}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            primaryColor: e.target.value
                          })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={editingTemplate.primaryColor || '#007bff'}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            primaryColor: e.target.value
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Cor Secundária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={editingTemplate.secondaryColor || '#6c757d'}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            secondaryColor: e.target.value
                          })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={editingTemplate.secondaryColor || '#6c757d'}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            secondaryColor: e.target.value
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fontFamily">Família da Fonte</Label>
                      <Select
                        value={editingTemplate.fontFamily || 'Arial, sans-serif'}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          fontFamily: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                          <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                          <SelectItem value="Georgia, serif">Georgia</SelectItem>
                          <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                          <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fontSize">Tamanho da Fonte</Label>
                      <Select
                        value={editingTemplate.fontSize || '14px'}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          fontSize: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="13px">13px</SelectItem>
                          <SelectItem value="14px">14px</SelectItem>
                          <SelectItem value="15px">15px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="titleFontSize">Tamanho do Título</Label>
                      <Select
                        value={editingTemplate.titleFontSize || '28px'}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          titleFontSize: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                          <SelectItem value="28px">28px</SelectItem>
                          <SelectItem value="32px">32px</SelectItem>
                          <SelectItem value="36px">36px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lineHeight">Altura da Linha</Label>
                      <Select
                        value={editingTemplate.lineHeight || '1.6'}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          lineHeight: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.2">1.2</SelectItem>
                          <SelectItem value="1.4">1.4</SelectItem>
                          <SelectItem value="1.6">1.6</SelectItem>
                          <SelectItem value="1.8">1.8</SelectItem>
                          <SelectItem value="2.0">2.0</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="headerAlignment">Alinhamento do Cabeçalho</Label>
                      <Select
                        value={editingTemplate.headerAlignment || 'center'}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          headerAlignment: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="contentAlignment">Alinhamento do Conteúdo</Label>
                      <Select
                        value={editingTemplate.contentAlignment || 'left'}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          contentAlignment: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                          <SelectItem value="justify">Justificado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="marginTop">Margem Superior</Label>
                      <Input
                        id="marginTop"
                        value={editingTemplate.marginTop || '25px'}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          marginTop: e.target.value
                        })}
                        placeholder="25px"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marginBottom">Margem Inferior</Label>
                      <Input
                        id="marginBottom"
                        value={editingTemplate.marginBottom || '25px'}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          marginBottom: e.target.value
                        })}
                        placeholder="25px"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marginLeft">Margem Esquerda</Label>
                      <Input
                        id="marginLeft"
                        value={editingTemplate.marginLeft || '25px'}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          marginLeft: e.target.value
                        })}
                        placeholder="25px"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marginRight">Margem Direita</Label>
                      <Input
                        id="marginRight"
                        value={editingTemplate.marginRight || '25px'}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          marginRight: e.target.value
                        })}
                        placeholder="25px"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borderColor">Cor da Borda</Label>
                      <div className="flex gap-2">
                        <Input
                          id="borderColor"
                          type="color"
                          value={editingTemplate.borderColor || '#007bff'}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            borderColor: e.target.value
                          })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={editingTemplate.borderColor || '#007bff'}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            borderColor: e.target.value
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="borderWidth">Largura da Borda</Label>
                      <Select
                        value={editingTemplate.borderWidth || '2px'}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          borderWidth: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1px">1px</SelectItem>
                          <SelectItem value="2px">2px</SelectItem>
                          <SelectItem value="3px">3px</SelectItem>
                          <SelectItem value="4px">4px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logoUrl">URL do Logo</Label>
                      <Input
                        id="logoUrl"
                        value={editingTemplate.logoUrl || ''}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          logoUrl: e.target.value
                        })}
                        placeholder="https://exemplo.com/logo.png"
                      />
                    </div>

                    <div>
                      <Label htmlFor="logoSize">Tamanho do Logo</Label>
                      <Select
                        value={editingTemplate.logoSize || '180px'}
                        onValueChange={(value) => setEditingTemplate({
                          ...editingTemplate,
                          logoSize: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="120px">Pequeno (120px)</SelectItem>
                          <SelectItem value="150px">Médio (150px)</SelectItem>
                          <SelectItem value="180px">Grande (180px)</SelectItem>
                          <SelectItem value="220px">Extra Grande (220px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Variáveis de Imagem Disponíveis:</h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li><code>{"{imagem}"}</code> - Imagem personalizada do template</li>
                        <li><code>{"{logo_url}"}</code> - Logo da empresa</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTemplate(null);
                    setShowDialog(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
                  {createTemplateMutation.isPending || updateTemplateMutation.isPending ? 'Salvando...' : 'Salvar Template'}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}