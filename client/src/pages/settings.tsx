import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings as SettingsIcon, Building2, Type, Palette, Save, RotateCcw, Bell, Send, CheckCircle, AlertCircle, FileText, Users, Key, Trash2, Eye, Edit, Plus, Download, Upload, HardDrive, Clock, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BackupTab } from "@/components/backup-tab";

interface SystemSettings {
  id?: number;
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  pdfSubtitle?: string;
  pdfPhone1?: string;
  pdfPhone2?: string;
  fontSize: string;
  pdfFontSize: string;
  fontFamily: string;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const defaultSettings: SystemSettings = {
  companyName: "Apoiotec Informática",
  cnpj: "15.292.813.0001-70",
  address: "Rua Maestro Vila Lobos, N° 381, Abolição 4, Mossoró-RN",
  phone: "84988288543 - 84988363828",
  email: "albano@hotmail.dk, marcelo@live.no",
  pdfSubtitle: "Assessoria e Assistência Técnica em Informática",
  pdfPhone1: "84988288543",
  pdfPhone2: "84988363828",
  fontSize: "22",
  pdfFontSize: "10",
  fontFamily: "system",
  theme: "light",
  primaryColor: "#2563eb",
  secondaryColor: "#00ff41",
  cardLayout: "double",
};

const fontSizeOptions = [
  { value: "14", label: "Pequeno (14px)" },
  { value: "16", label: "Compacto (16px)" },
  { value: "18", label: "Reduzido (18px)" },
  { value: "22", label: "Padrão (22px)" },
  { value: "24", label: "Médio (24px)" },
  { value: "26", label: "Grande (26px)" },
  { value: "28", label: "Maior (28px)" },
  { value: "30", label: "Muito Grande (30px)" },
  { value: "32", label: "Extra Grande (32px)" },
  { value: "34", label: "Enorme (34px)" },
  { value: "36", label: "Gigante (36px)" },
  { value: "38", label: "Colossal (38px)" },
  { value: "40", label: "Máximo (40px)" },
];

const pdfFontSizeOptions = [
  { value: "7", label: "Muito Pequeno (7pt)" },
  { value: "8", label: "Pequeno (8pt)" },
  { value: "9", label: "Compacto (9pt)" },
  { value: "10", label: "Padrão (10pt)" },
  { value: "11", label: "Médio (11pt)" },
  { value: "12", label: "Grande (12pt)" },
  { value: "13", label: "Maior (13pt)" },
  { value: "14", label: "Muito Grande (14pt)" },
  { value: "15", label: "Extra Grande (15pt)" },
  { value: "16", label: "Gigante (16pt)" },
];

const fontFamilyOptions = [
  { value: "system", label: "Padrão do Sistema" },
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "opensans", label: "Open Sans" },
  { value: "arial", label: "Arial" },
  { value: "helvetica", label: "Helvetica" },
];

const cardLayoutOptions = [
  { value: "single", label: "📌 Coluna Única (1 card por linha)" },
  { value: "double", label: "📊 Coluna Dupla (2-3 cards por linha)" },
];

const notificationGroups = [
  {
    title: '📱 Chamados',
    items: [
      { key: 'call_created', label: '🎯 Criado' },
      { key: 'call_updated', label: '✏️ Atualizado' },
      { key: 'call_deleted', label: '🗑️ Deletado' },
    ]
  },
  {
    title: '🛠️ Serviços',
    items: [
      { key: 'service_created', label: '🎯 Criado' },
      { key: 'service_updated', label: '✏️ Atualizado' },
      { key: 'service_deleted', label: '🗑️ Deletado' },
      { key: 'call_to_service', label: '📋 Chamado → Serviço' },
    ]
  },
  {
    title: '💰 Financeiro',
    items: [
      { key: 'financial_created', label: '💵 Criado' },
      { key: 'financial_updated', label: '✏️ Atualizado' },
      { key: 'financial_deleted', label: '🗑️ Deletado' },
      { key: 'payment_received', label: '✅ Pagamento Recebido' },
      { key: 'financial_discount', label: '💸 Desconto Aplicado' },
      { key: 'installment_created', label: '📦 Parcela Criada' },
      { key: 'parcelamento_created', label: '📊 Parcelamento Criado' },
      { key: 'service_to_financial', label: '💳 Serviço → Faturamento' },
    ]
  },
  {
    title: '📝 Notas de Clientes',
    items: [
      { key: 'client_note_created', label: '✏️ Nota Adicionada' },
      { key: 'client_note_updated', label: '✏️ Nota Editada' },
      { key: 'client_note_deleted', label: '🗑️ Nota Deletada' },
    ]
  },
  {
    title: '👥 Clientes',
    items: [
      { key: 'client_created', label: '🎯 Cliente Criado' },
      { key: 'client_updated', label: '✏️ Cliente Atualizado' },
      { key: 'client_deleted', label: '🗑️ Cliente Deletado' },
    ]
  },
  {
    title: '📄 Orçamentos',
    items: [
      { key: 'quote_created', label: '🎯 Orçamento Criado' },
      { key: 'quote_updated', label: '✏️ Orçamento Atualizado' },
    ]
  },
  {
    title: '👤 Usuários',
    items: [
      { key: 'user_created', label: '🎯 Usuário Criado' },
      { key: 'user_updated', label: '✏️ Usuário Atualizado' },
    ]
  },
];

const flatNotificationList = notificationGroups.flatMap(g => g.items);

const userFormSchemaCreate = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().default("user"),
});

const userFormSchemaEdit = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().default("user"),
});

type UserFormData = z.infer<typeof userFormSchemaCreate>;
type UserFormDataEdit = z.infer<typeof userFormSchemaEdit>;

export default function Settings({ currentUser }: { currentUser?: any }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showViewUserDialog, setShowViewUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchemaCreate),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      role: "user",
    },
  });

  const editUserForm = useForm<UserFormDataEdit>({
    resolver: zodResolver(userFormSchemaEdit),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      role: "user",
    },
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userId = loggedUser?.id || 1;

  useEffect(() => {
    setCurrentUserId(userId);
    setUserName(loggedUser?.name || loggedUser?.username || "Usuário");
  }, [userId, loggedUser]);

  // Buscar configurações existentes
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const { data: preferences = [] } = useQuery({
    queryKey: [`/api/notification-preferences/${userId}`],
    enabled: userId !== null && userId !== undefined,
    queryFn: async () => {
      const response = await fetch(`/api/notification-preferences/${userId}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: telegramConfig, refetch: refetchTelegram } = useQuery({
    queryKey: ["/api/telegram-config", currentUserId],
    enabled: currentUserId !== null,
    queryFn: async () => {
      const response = await fetch(`/api/telegram-config?userId=${currentUserId}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Sincronizar estado local quando os dados do backend carregarem
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings as SystemSettings);
      applySettings(currentSettings as SystemSettings);
    }
  }, [currentSettings]);

  useEffect(() => {
    if (telegramConfig && telegramConfig.botToken) {
      setBotToken(telegramConfig.botToken || "");
      setChatId(telegramConfig.chatId || "");
      setIsActive(telegramConfig.isActive ?? true);
    }
  }, [telegramConfig]);

  // Mutação para salvar configurações
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const { id, createdAt, updatedAt, logo, ...settingsToSave } = newSettings;
      const response = await apiRequest("POST", "/api/settings", settingsToSave);
      return response.json();
    },
    onSuccess: (data) => {
      applySettings(data as SystemSettings);
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setHasChanges(false);
      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso!",
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

  const updateNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/notification-preferences", {
        userId,
        notificationType: data.notificationType,
        enabled: data.enabled,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notification-preferences/${userId}`] });
      toast({
        title: "Sucesso",
        description: "Preferência atualizada!",
      });
    },
  });

  const saveTelegramMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["/api/telegram-config", currentUserId] });
      refetchTelegram();
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

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number; password: string }) => {
      const response = await apiRequest("POST", `/api/users/${userId}/reset-password`, {
        newPassword: password,
      });
      if (!response.ok) throw new Error("Erro ao resetar senha");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Senha resetada com sucesso!",
      });
      setShowResetDialog(false);
      setResetPasswordUserId(null);
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao resetar senha",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      if (!response.ok) throw new Error("Erro ao criar usuário");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Usuário criado com sucesso!",
      });
      setShowAddUserDialog(false);
      userForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: Partial<UserFormData> }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}`, data);
      if (!response.ok) throw new Error("Erro ao atualizar usuário");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Usuário atualizado com sucesso!",
      });
      setShowEditUserDialog(false);
      setEditingUser(null);
      userForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/users/${userId}`);
      if (!response.ok) throw new Error("Erro ao deletar usuário");
      return null;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Usuário deletado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar usuário",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleNotificationToggle = (notificationType: string, currentEnabled: boolean) => {
    updateNotificationMutation.mutate({ notificationType, enabled: !currentEnabled });
  };

  const handleReset = () => {
    setSettings(currentSettings as SystemSettings || defaultSettings);
    setHasChanges(false);
  };

  const applySettings = (newSettings: SystemSettings) => {
    const root = document.documentElement;
    root.style.setProperty("--font-size-base", `${newSettings.fontSize}px`);
    root.style.setProperty("--primary-color", newSettings.primaryColor);
    root.style.setProperty("--secondary-color", newSettings.secondaryColor);
    
    if (newSettings.fontFamily !== "system") {
      document.body.style.fontFamily = `"${newSettings.fontFamily}", sans-serif`;
    }
  };

  if (isLoading) {
    return <div className="p-4">Carregando configurações...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 min-h-screen bg-black dark:bg-black">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-white dark:text-white">
          <SettingsIcon className="w-8 h-8 text-cyan-400" />
          Configurações
        </h1>
        <p className="text-gray-400 dark:text-gray-400 mt-2">Gerencie as preferências da sua aplicação</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-transparent gap-3 p-0">
          <TabsTrigger value="company" className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-lg border-2 border-slate-700 hover:border-cyan-500 data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/10 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 transition-all text-slate-300 hover:text-cyan-300 data-[state=active]:text-cyan-300 font-medium text-xs sm:text-sm">
            <Building2 className="w-5 h-5" />
            <span>Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-lg border-2 border-slate-700 hover:border-cyan-500 data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/10 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 transition-all text-slate-300 hover:text-cyan-300 data-[state=active]:text-cyan-300 font-medium text-xs sm:text-sm">
            <Palette className="w-5 h-5" />
            <span>Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-lg border-2 border-slate-700 hover:border-cyan-500 data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/10 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 transition-all text-slate-300 hover:text-cyan-300 data-[state=active]:text-cyan-300 font-medium text-xs sm:text-sm">
            <Bell className="w-5 h-5" />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-lg border-2 border-slate-700 hover:border-cyan-500 data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/10 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 transition-all text-slate-300 hover:text-cyan-300 data-[state=active]:text-cyan-300 font-medium text-xs sm:text-sm">
            <HardDrive className="w-5 h-5" />
            <span>Backups</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-lg border-2 border-slate-700 hover:border-cyan-500 data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500/10 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 transition-all text-slate-300 hover:text-cyan-300 data-[state=active]:text-cyan-300 font-medium text-xs sm:text-sm">
            <Users className="w-5 h-5" />
            <span>Usuários</span>
          </TabsTrigger>
        </TabsList>


        {/* TAB: Informações da Empresa */}
        <TabsContent value="company">
          <Card className="bg-gray-900 border-2 border-cyan-500">
            <CardHeader className="border-b-2 border-cyan-500">
              <CardTitle className="text-cyan-400">Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Apoiotec Informática"
                />
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={settings.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  placeholder="15.292.813.0001-70"
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Rua Maestro Vila Lobos, N° 381, Abolição 4, Mossoró-RN"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="84988288543 - 84988363828"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={settings.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="albano@hotmail.dk, marcelo@live.no"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Aparência (Consolidado com Accordion) */}
        <TabsContent value="appearance">
          <Card className="bg-gray-900 border-2 border-cyan-500">
            <CardHeader className="border-b-2 border-cyan-500">
              <CardTitle className="text-cyan-400">Aparência e Layout</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Customize a aparência da sua aplicação</p>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible defaultValue="layout" className="space-y-4">
                {/* Layout e Tipografia */}
                <AccordionItem value="layout" className="border border-cyan-500/30 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-cyan-400" />
                      <span className="font-semibold">Layout e Tipografia</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div>
                      <Label htmlFor="fontSize">Tamanho da Fonte (Interface)</Label>
                      <Select value={settings.fontSize} onValueChange={(value) => handleChange("fontSize", value)}>
                        <SelectTrigger id="fontSize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontSizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="pdfFontSize">Tamanho da Fonte (PDFs)</Label>
                      <Select value={settings.pdfFontSize} onValueChange={(value) => handleChange("pdfFontSize", value)}>
                        <SelectTrigger id="pdfFontSize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pdfFontSizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="fontFamily">Família de Fontes</Label>
                      <Select value={settings.fontFamily} onValueChange={(value) => handleChange("fontFamily", value)}>
                        <SelectTrigger id="fontFamily">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontFamilyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border-t pt-4">
                      <Label className="text-base font-semibold mb-3 block">📊 Disposição de Cards</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Escolha como os cards devem aparecer nas páginas de Chamados, Serviços e Financeiro</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cardLayoutOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              handleChange("cardLayout", option.value);
                              localStorage.setItem("cardLayout", option.value as any);
                              window.dispatchEvent(new CustomEvent("layoutChange", { detail: { layout: option.value } }));
                            }}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              settings.cardLayout === option.value
                                ? "border-cyan-500 bg-cyan-500/10"
                                : "border-gray-300 dark:border-gray-600 hover:border-cyan-500"
                            }`}
                          >
                            <p className="font-semibold text-gray-900 dark:text-white">{option.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Cores */}
                <AccordionItem value="colors" className="border border-cyan-500/30 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-cyan-400" />
                      <span className="font-semibold">Personalização de Cores</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div>
                      <Label>Cor Primária</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          id="primaryColor"
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => handleChange("primaryColor", e.target.value)}
                          className="w-16 h-10 p-1 rounded"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => handleChange("primaryColor", e.target.value)}
                          placeholder="#2563eb"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Cor Secundária</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          id="secondaryColor"
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => handleChange("secondaryColor", e.target.value)}
                          className="w-16 h-10 p-1 rounded"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => handleChange("secondaryColor", e.target.value)}
                          placeholder="#00ff41"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-lg font-medium mb-4">Pré-visualização das Cores</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className="p-4 rounded-lg text-white font-medium"
                          style={{ backgroundColor: settings.primaryColor }}
                        >
                          Cor Primária
                        </div>
                        <div 
                          className="p-4 rounded-lg text-black font-medium"
                          style={{ backgroundColor: settings.secondaryColor }}
                        >
                          Cor Secundária
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Configuração de PDF */}
                <AccordionItem value="pdf" className="border border-cyan-500/30 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <span className="font-semibold">Configuração de PDF</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div>
                      <Label htmlFor="pdfCompany">Nome da Empresa (Cabeçalho PDF)</Label>
                      <Input
                        id="pdfCompany"
                        value={settings.companyName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                        placeholder="Apoiotec Informática"
                      />
                      <p className="text-xs text-gray-500 mt-1">Aparece na primeira linha da barra azul</p>
                    </div>

                    <div>
                      <Label htmlFor="pdfSubtitle">Subtítulo (Segunda Linha)</Label>
                      <Input
                        id="pdfSubtitle"
                        value={settings.pdfSubtitle}
                        onChange={(e) => handleChange("pdfSubtitle", e.target.value)}
                        placeholder="Assessoria e Assistência Técnica em Informática"
                      />
                      <p className="text-xs text-gray-500 mt-1">Aparece na segunda linha da barra azul</p>
                    </div>

                    <div>
                      <Label htmlFor="pdfCnpj">CNPJ</Label>
                      <Input
                        id="pdfCnpj"
                        value={settings.cnpj}
                        onChange={(e) => handleChange("cnpj", e.target.value)}
                        placeholder="15.292.813.0001-70"
                      />
                      <p className="text-xs text-gray-500 mt-1">Aparece na terceira linha da barra azul</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pdfPhone1">Telefone 1</Label>
                        <Input
                          id="pdfPhone1"
                          value={settings.pdfPhone1}
                          onChange={(e) => handleChange("pdfPhone1", e.target.value)}
                          placeholder="84988288543"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pdfPhone2">Telefone 2</Label>
                        <Input
                          id="pdfPhone2"
                          value={settings.pdfPhone2}
                          onChange={(e) => handleChange("pdfPhone2", e.target.value)}
                          placeholder="84988363828"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Pré-visualização do Cabeçalho PDF:</h4>
                      <div className="bg-primary text-white p-4 rounded" style={{backgroundColor: settings.primaryColor}}>
                        <div className="font-bold text-lg">{settings.companyName}</div>
                        <div className="text-sm">{settings.pdfSubtitle}</div>
                        <div className="text-xs mt-2">
                          CNPJ {settings.cnpj} - Telefone: {settings.pdfPhone1}
                          {settings.pdfPhone2 && `, ${settings.pdfPhone2}`}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Notificações */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* Todas as Notificações - Layout 2 Colunas */}
            <Card className="border-4 border-cyan-500 dark:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 shadow-lg dark:shadow-cyan-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🦁 <Bell className="w-5 h-5 text-cyan-500" />
                  Preferências de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Escolha quais notificações você deseja receber no Telegram
                </p>
                
                {/* Botões de Controle Rápido */}
                <div className="flex gap-2 mb-6">
                  <Button
                    size="sm"
                    onClick={() => {
                      flatNotificationList.forEach((notif) => {
                        const pref = (Array.isArray(preferences) ? preferences : []).find((p: any) => p.notificationType === notif.key);
                        const enabled = pref ? pref.enabled : false;
                        if (!enabled) {
                          updateNotificationMutation.mutate({ notificationType: notif.key, enabled: true });
                        }
                      });
                    }}
                    className="flex-1"
                    data-testid="button-enable-all-notifications"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ativar Todas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      flatNotificationList.forEach((notif) => {
                        const pref = (Array.isArray(preferences) ? preferences : []).find((p: any) => p.notificationType === notif.key);
                        const enabled = pref ? pref.enabled : false;
                        if (enabled) {
                          updateNotificationMutation.mutate({ notificationType: notif.key, enabled: false });
                        }
                      });
                    }}
                    className="flex-1"
                    data-testid="button-disable-all-notifications"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Desativar Todas
                  </Button>
                </div>

                {/* Grupos de Notificações */}
                <div className="space-y-6">
                  {notificationGroups.map((group, idx) => {
                    const neonColors = [
                      "border-cyan-500 dark:border-cyan-400 hover:shadow-cyan-500/50",
                      "border-green-500 dark:border-green-400 hover:shadow-green-500/50",
                      "border-purple-500 dark:border-purple-400 hover:shadow-purple-500/50",
                      "border-pink-500 dark:border-pink-400 hover:shadow-pink-500/50",
                      "border-yellow-500 dark:border-yellow-400 hover:shadow-yellow-500/50",
                      "border-blue-500 dark:border-blue-400 hover:shadow-blue-500/50"
                    ];
                    const colorClass = neonColors[idx % neonColors.length];
                    
                    return (
                      <div key={group.title} className={`border-l-4 ${colorClass.split(" ")[0]} pl-4 py-3 rounded-lg border-4 ${colorClass} p-4 bg-gradient-to-r from-transparent to-transparent hover:shadow-lg transition-all`}>
                        <h3 className="font-bold text-lg mb-3">{group.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.items.map((notif) => {
                            const pref = (Array.isArray(preferences) ? preferences : []).find((p: any) => p.notificationType === notif.key);
                            const enabled = pref ? pref.enabled : true; // Padrão agora é VERDADEIRO
                            
                            return (
                              <div key={notif.key} className={`flex items-center justify-between p-3 border-4 rounded-lg transition-all ${enabled ? colorClass.split(" ")[0].replace("border-", "border-4 border-") + " " + colorClass.slice(colorClass.indexOf("dark")) : "border-gray-300 dark:border-gray-600"} hover:bg-gray-50 dark:hover:bg-gray-900/50`}>
                                <span className="text-sm font-medium">{notif.label}</span>
                                <Switch
                                  checked={enabled}
                                  onCheckedChange={() => handleNotificationToggle(notif.key, enabled)}
                                  disabled={updateNotificationMutation.isPending}
                                  data-testid={`switch-notification-${notif.key}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Configuração do Telegram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Configuração do Telegram
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Configurando para: <span className="font-bold">{userName}</span>
                  </p>
                </div>

                <div>
                  <Label htmlFor="botToken">Bot Token do Telegram</Label>
                  <Input
                    id="botToken"
                    type="password"
                    placeholder="Digite o token do seu bot"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obtenha em https://t.me/BotFather
                  </p>
                </div>

                <div>
                  <Label htmlFor="chatId">Chat ID</Label>
                  <Input
                    id="chatId"
                    placeholder="ID do chat ou grupo"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Envie /start para o bot para descobrir seu Chat ID
                  </p>
                </div>

                <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <Label className="text-sm font-semibold">Ativar Notificações</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => saveTelegramMutation.mutate()}
                    disabled={saveTelegramMutation.isPending}
                    className="flex-1 bg-primary hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar Telegram
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

                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Como Configurar:</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>1️⃣ Acesse @BotFather no Telegram e crie um bot</li>
                    <li>2️⃣ Copie o token recebido</li>
                    <li>3️⃣ Envie /start para seu bot</li>
                    <li>4️⃣ Cole os dados acima e clique em Salvar</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Gerenciamento de Usuários */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Gerenciamento de Usuários
                  </CardTitle>
                </div>
                <Button
                  onClick={() => {
                    setEditingUser(null);
                    userForm.reset();
                    setShowAddUserDialog(true);
                  }}
                  className="bg-primary hover:bg-blue-700 text-white"
                  data-testid="button-add-user"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Gerencie usuários, resete senhas e edite dados</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.isArray(allUsers) && allUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allUsers.map((user: any) => (
                    <Card key={user.id} className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow flex flex-col">
                      <CardContent className="pt-6 flex-1 flex flex-col">
                        <div className="space-y-3 flex-1">
                          {/* Header com status */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-primary dark:text-blue-400 uppercase tracking-wide">Usuário</p>
                              <p className="font-bold text-gray-900 dark:text-white text-lg">{user.username}</p>
                            </div>
                            <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                              {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                            </span>
                          </div>

                          {/* Dados do usuário */}
                          <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
                            {user.name && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Nome</p>
                                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                              </div>
                            )}
                            {user.email && (
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                                <p className="font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botões de ação - 4 botões alinhados na parte inferior */}
                        <div className="flex gap-2 border-t border-blue-200 dark:border-blue-700 pt-3 mt-3">
                          <Button
                            onClick={() => {
                              setViewingUser(user);
                              setShowViewUserDialog(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                            title="Visualizar"
                            data-testid={`button-view-user-${user.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingUser(user);
                              editUserForm.reset({
                                username: user.username,
                                name: user.name || "",
                                email: user.email || "",
                                role: user.role || "user",
                                password: "",
                              });
                              setShowEditUserDialog(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            title="Editar"
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setResetPasswordUserId(user.id);
                              setShowResetDialog(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            title="Resetar Senha"
                            data-testid={`button-reset-password-${user.id}`}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja deletar o usuário ${user.username}?`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Deletar"
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhum usuário encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Backups */}
        <TabsContent value="backups">
          <BackupTab />
        </TabsContent>
      </Tabs>

      {/* Dialog para Adicionar Usuário */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/30">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Crie um novo usuário para o sistema</DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit((data) => {
              // Fazer trim dos campos de texto
              const trimmedData = {
                ...data,
                username: data.username?.trim() || "",
                name: data.name?.trim() || "",
                email: data.email?.trim() || "",
              };
              createUserMutation.mutate(trimmedData);
            })} className="space-y-4">
              <FormField control={userForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário</FormLabel>
                  <FormControl><Input placeholder="usuario123" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={userForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={userForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Seu nome" {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={userForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="email@example.com" {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={userForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value || "user"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>Cancelar</Button>
                <Button type="submit" disabled={createUserMutation.isPending} className="bg-primary hover:bg-blue-700">
                  {createUserMutation.isPending ? "Criando..." : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Usuário */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/30">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize as informações do usuário</DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit((data) => {
              if (editingUser) {
                // Fazer trim dos campos de texto
                const trimmedData = {
                  ...data,
                  username: data.username?.trim() || "",
                  name: data.name?.trim() || "",
                  email: data.email?.trim() || "",
                };
                const { password, ...dataWithoutPassword } = trimmedData;
                updateUserMutation.mutate({ userId: editingUser.id, data: password ? trimmedData : dataWithoutPassword });
              }
            })} className="space-y-4">
              <FormField control={editUserForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário</FormLabel>
                  <FormControl><Input placeholder="usuario123" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editUserForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Seu nome" {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editUserForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="email@example.com" {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editUserForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value || "user"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>Cancelar</Button>
                <Button type="submit" disabled={updateUserMutation.isPending} className="bg-primary hover:bg-blue-700">
                  {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Visualizar Usuário */}
      <Dialog open={showViewUserDialog} onOpenChange={setShowViewUserDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/30">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Nome de Usuário</p>
                <p className="font-bold text-lg">{viewingUser.username}</p>
              </div>
              {viewingUser.name && (
                <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                  <p className="font-medium">{viewingUser.name}</p>
                </div>
              )}
              {viewingUser.email && (
                <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium">{viewingUser.email}</p>
                </div>
              )}
              <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Função</p>
                <p className="font-medium">{viewingUser.role === 'admin' ? '👑 Administrador' : '👤 Usuário'}</p>
              </div>
              <Button onClick={() => setShowViewUserDialog(false)} className="w-full bg-primary hover:bg-blue-700">Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para Reset de Senha */}
      {showResetDialog && (
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/30">
            <DialogHeader>
              <DialogTitle>Resetar Senha</DialogTitle>
              <DialogDescription>Digite a nova senha para o usuário</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResetDialog(false);
                    setResetPasswordUserId(null);
                    setNewPassword("");
                  }}
                  data-testid="button-cancel-reset"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (newPassword.trim().length === 0) {
                      toast({
                        title: "Erro",
                        description: "Digite uma senha",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (resetPasswordUserId !== null) {
                      resetPasswordMutation.mutate({
                        userId: resetPasswordUserId,
                        password: newPassword,
                      });
                    }
                  }}
                  disabled={resetPasswordMutation.isPending || !newPassword}
                  className="bg-primary hover:bg-blue-700"
                  data-testid="button-confirm-reset"
                >
                  {resetPasswordMutation.isPending ? "Resetando..." : "Resetar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Botões de Ação */}
      <div className="mt-6 flex gap-3">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || saveSettingsMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Configurações
        </Button>
        <Button 
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Desfazer
        </Button>
      </div>

      {hasChanges && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            ⚠️ Você tem alterações não salvas. Clique em "Salvar Configurações" para aplicar as mudanças permanentemente.
          </p>
        </div>
      )}
    </div>
  );
}
