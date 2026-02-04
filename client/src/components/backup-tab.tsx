import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Download, Upload, HardDrive, Loader2, Trash2, Clock, Play, RotateCw, Folder } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface BackupRecord {
  id: number;
  filename: string;
  fileSize?: number;
  status: string;
  createdAt: string;
  notes?: string;
  wasScheduled?: boolean;
  sentToTelegram?: boolean;
  type?: "manual" | "automatic" | "scheduled";
}

interface BackupSchedule {
  id: number;
  frequency: string;
  scheduledTime: string;
  sendToTelegram: boolean;
  isActive: boolean;
  lastExecutedAt?: string;
  nextExecutionAt?: string;
  createdAt: string;
}

interface BackupExecutionLog {
  id: number;
  scheduleId: number;
  status: string;
  scheduledTime: string;
  executedAt?: string;
  fileSize?: number;
  sentToTelegram: boolean;
  errorMessage?: string;
  createdAt: string;
}

export function BackupTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showTelegramDialog, setShowTelegramDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showBackupsModal, setShowBackupsModal] = useState(false);
  const [sendToTelegram, setSendToTelegram] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BackupSchedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({ frequency: "diario", scheduledTime: "02:00", sendToTelegram: true });
  const [selectedBackups, setSelectedBackups] = useState<Set<string>>(new Set());

  // Query para buscar histórico de backups
  const { data: backupHistory = [], isLoading, error } = useQuery<BackupRecord[]>({
    queryKey: ["/api/backup/history"],
    staleTime: 0,
    gcTime: 0,
  });

  // Query para buscar agendamentos
  const { data: schedules = [] } = useQuery<BackupSchedule[]>({
    queryKey: ["/api/backup/schedules"],
    staleTime: 0,
    gcTime: 0,
  });

  // Query para buscar logs de execução
  const { data: executionLogs = [] } = useQuery<BackupExecutionLog[]>({
    queryKey: ["/api/backup/execution-logs"],
    staleTime: 0,
    gcTime: 0,
  });

  // Mutation para gerar backup
  const generateBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/backup/generate", { sendToTelegram });
      if (!response.ok) throw new Error("Erro ao gerar backup");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: sendToTelegram ? "Backup gerado, baixado e enviado para Telegram!" : "Backup gerado e baixado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/history"] });
      setShowTelegramDialog(false);
      setSendToTelegram(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao gerar backup",
        variant: "destructive",
      });
    },
  });

  // Mutation para restaurar backup
  const restoreBackupMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/backup/restore", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao restaurar backup");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Backup restaurado com sucesso! Por favor, recarregue a página.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/history"] });
      setShowConfirmDialog(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao restaurar backup",
        variant: "destructive",
      });
    },
  });

  // Mutation para criar agendamento
  const createScheduleMutation = useMutation({
    mutationFn: async (data: typeof newSchedule) => {
      const response = await apiRequest("POST", "/api/backup/schedules", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Agendamento criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/schedules"] });
      setShowScheduleDialog(false);
      setNewSchedule({ frequency: "diario", scheduledTime: "02:00", sendToTelegram: true });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar agendamento
  const updateScheduleMutation = useMutation({
    mutationFn: async (data: Partial<BackupSchedule>) => {
      if (!editingSchedule) throw new Error("Nenhum agendamento selecionado");
      const response = await apiRequest("PATCH", `/api/backup/schedules/${editingSchedule.id}`, data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Agendamento atualizado!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/schedules"] });
      setEditingSchedule(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar agendamento
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/backup/schedules/${id}`, {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Agendamento deletado!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/schedules"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao deletar agendamento",
        variant: "destructive",
      });
    },
  });

  // Mutation para alternar agendamento
  const toggleScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/backup/schedules/${id}/toggle`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backup/schedules"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao alternar agendamento",
        variant: "destructive",
      });
    },
  });

  // Mutation para testar execução
  const testExecuteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/backup/test-execution/${id}`, {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Backup de teste executado e enviado para Telegram!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/execution-logs"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao executar teste",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar backup individual
  const deleteBackupMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/backup/${id}`, {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Backup deletado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/history"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao deletar backup",
        variant: "destructive",
      });
    },
  });

  // Mutation para limpar todos os backups
  const clearAllBackupsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/backup", {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Todos os backups foram deletados",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/history"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao limpar backups",
        variant: "destructive",
      });
    },
  });

  // Mutation para limpar todos os logs
  const clearAllLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/backup/execution-logs/all", {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Histórico de execuções foi limpo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/execution-logs"] });
    },
    onError: (error: any) => {
      console.error("Erro ao limpar logs:", error);
      toast({
        title: "Erro",
        description: "Erro ao limpar logs",
        variant: "destructive",
      });
    },
  });

  // Buscar arquivos de backup
  const backupFilesQuery = useQuery({
    queryKey: ["/api/backup/files"],
    queryFn: async () => {
      const res = await fetch("/api/backup/files");
      return res.json();
    },
  });

  // Deletar arquivo de backup
  const deleteBackupFileMutation = useMutation({
    mutationFn: async (filename: string) => {
      const response = await apiRequest("DELETE", `/api/backup/file/${encodeURIComponent(filename)}`, {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Arquivo deletado com sucesso",
      });
      backupFilesQuery.refetch();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao deletar arquivo",
        variant: "destructive",
      });
    },
  });

  // Abrir pasta de backups no modal
  const handleOpenBackupsFolder = async () => {
    try {
      await backupFilesQuery.refetch();
      setShowBackupsModal(true);
      setSelectedBackups(new Set());
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao listar arquivos",
        variant: "destructive",
      });
    }
  };

  // Toggle seleção de backup individual
  const toggleBackupSelection = (filename: string) => {
    const newSelected = new Set(selectedBackups);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedBackups(newSelected);
  };

  // Selecionar todos
  const toggleSelectAll = () => {
    if (selectedBackups.size === backupFilesQuery.data?.files?.length) {
      setSelectedBackups(new Set<string>());
    } else {
      const allFiles = new Set<string>(backupFilesQuery.data?.files?.map((f: any) => f.name) || []);
      setSelectedBackups(allFiles);
    }
  };

  // Mutation para deletar múltiplos backups
  const deleteMultipleBackupsMutation = useMutation({
    mutationFn: async (filenames: string[]) => {
      const promises = filenames.map(filename =>
        apiRequest("DELETE", `/api/backup/file/${encodeURIComponent(filename)}`, {})
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: `${selectedBackups.size} arquivo(s) deletado(s) com sucesso`,
      });
      setSelectedBackups(new Set());
      backupFilesQuery.refetch();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao deletar arquivo(s)",
        variant: "destructive",
      });
    },
  });

  // Deletar todos selecionados
  const handleDeleteSelected = () => {
    if (selectedBackups.size === 0) {
      toast({
        title: "Selecione arquivos",
        description: "Nenhum arquivo selecionado para deletar",
      });
      return;
    }
    
    if (confirm(`Deletar ${selectedBackups.size} arquivo(s) selecionado(s)?`)) {
      deleteMultipleBackupsMutation.mutate(Array.from(selectedBackups));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setShowConfirmDialog(true);
    }
  };

  const handleRestoreConfirm = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      restoreBackupMutation.mutate(file);
    }
  };

  const handleGenerateBackup = () => {
    setShowTelegramDialog(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Desconhecido";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb > 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sucesso":
        return "bg-green-900 text-green-200 border-green-600";
      case "atrasado":
        return "bg-yellow-900 text-yellow-200 border-yellow-600";
      default:
        return "bg-red-900 text-red-200 border-red-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sucesso":
        return <CheckCircle className="w-3 h-3" />;
      case "atrasado":
        return <Clock className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Card de Ações Manuais */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-blue-500 shadow-lg shadow-blue-500/20">
        <CardHeader className="border-b-2 border-blue-500">
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <HardDrive className="w-5 h-5" />
            Backups Manuais
          </CardTitle>
          <p className="text-sm text-slate-300 mt-2">
            Crie e restaure backups manualmente do seu banco de dados
          </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={handleGenerateBackup}
              disabled={generateBackupMutation.isPending}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold border border-blue-400 shadow-lg shadow-blue-500/50"
              data-testid="button-generate-backup"
            >
              {generateBackupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Gerar Novo Backup
                </>
              )}
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={restoreBackupMutation.isPending}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-semibold border border-cyan-400 shadow-lg shadow-cyan-500/50"
              data-testid="button-restore-backup"
            >
              {restoreBackupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Restaurar Backup
                </>
              )}
            </Button>

            <Button
              onClick={handleOpenBackupsFolder}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold border border-orange-400 shadow-lg shadow-orange-500/50"
              data-testid="button-open-backups-folder"
            >
              <Folder className="w-4 h-4" />
              Pasta Backups
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-backup-file"
            />
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Backups são salvos automaticamente. Configure agendamentos automáticos abaixo.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card de Backups Automáticos */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-purple-500 shadow-lg shadow-purple-500/20">
        <CardHeader className="border-b-2 border-purple-500">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Clock className="w-5 h-5" />
              Backups Automáticos
            </CardTitle>
            <Button
              onClick={() => setShowScheduleDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border border-purple-400 text-sm"
              data-testid="button-add-schedule"
            >
              + Novo Agendamento
            </Button>
          </div>
          <p className="text-sm text-slate-300 mt-2">
            {schedules.length} agendamento(s) configurado(s)
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {schedules.length > 0 ? (
            <div className="space-y-3">
              {schedules.map((schedule: BackupSchedule) => (
                <div
                  key={schedule.id}
                  className="p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-all"
                  data-testid={`card-schedule-${schedule.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-purple-300">
                          🕐 {schedule.scheduledTime} ({schedule.frequency === "diario" ? "Diariamente" : schedule.frequency === "semanal" ? "Semanalmente" : "Mensalmente"})
                        </p>
                        <Badge
                          className={`${
                            schedule.isActive
                              ? "bg-green-900 text-green-200 border border-green-600"
                              : "bg-gray-900 text-gray-200 border border-gray-600"
                          }`}
                        >
                          {schedule.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        {schedule.sendToTelegram && <p>📱 Enviará para Telegram</p>}
                        {schedule.lastExecutedAt && (
                          <p>✅ Último: {new Date(schedule.lastExecutedAt).toLocaleString("pt-BR", { timeZone: "Etc/GMT+3" })}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => setEditingSchedule(schedule)}
                        size="sm"
                        variant="outline"
                        className="border-purple-500 text-purple-300 hover:bg-purple-900/30"
                        data-testid={`button-edit-schedule-${schedule.id}`}
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => testExecuteMutation.mutate(schedule.id)}
                        disabled={testExecuteMutation.isPending}
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-300 hover:bg-blue-900/30"
                        data-testid={`button-test-schedule-${schedule.id}`}
                      >
                        {testExecuteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button
                        onClick={() => toggleScheduleMutation.mutate(schedule.id)}
                        size="sm"
                        variant="outline"
                        className={`${schedule.isActive ? "border-red-500 text-red-300" : "border-green-500 text-green-300"}`}
                        data-testid={`button-toggle-schedule-${schedule.id}`}
                      >
                        {schedule.isActive ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-300 hover:bg-red-900/30"
                        data-testid={`button-delete-schedule-${schedule.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nenhum agendamento configurado</p>
              <p className="text-sm text-slate-500 mt-1">
                Clique em "+ Novo Agendamento" para criar o primeiro
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Histórico de Backups */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-cyan-500 shadow-lg shadow-cyan-500/20">
        <CardHeader className="border-b-2 border-cyan-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <HardDrive className="w-5 h-5" />
                Histórico de Backups
              </CardTitle>
              <p className="text-sm text-slate-300 mt-2">
                {backupHistory.length} backup(s) registrado(s) • ~{((backupHistory.reduce((sum, b) => sum + (b.fileSize || 0), 0)) / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {backupHistory.length > 0 && (
              <Button
                onClick={() => {
                  if (confirm("Tem certeza que deseja deletar TODOS os backups? Esta ação não pode ser desfeita.")) {
                    clearAllBackupsMutation.mutate();
                  }
                }}
                disabled={clearAllBackupsMutation.isPending}
                className="bg-red-900 hover:bg-red-800 text-red-200 border border-red-600 text-sm"
                data-testid="button-clear-all-backups"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Tudo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : backupHistory.length > 0 ? (
            <div className="space-y-3">
              {backupHistory.map((backup: BackupRecord) => (
                <div
                  key={backup.id}
                  className="p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition-all"
                  data-testid={`card-backup-${backup.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <p className="font-mono text-sm text-cyan-300 truncate flex-1">
                          {backup.filename}
                        </p>
                        <Badge
                          className={`flex-shrink-0 border ${
                            backup.status === "sucesso"
                              ? "bg-green-900 text-green-200 border-green-600"
                              : "bg-red-900 text-red-200 border-red-600"
                          }`}
                          data-testid={`badge-backup-status-${backup.id}`}
                        >
                          {backup.status === "sucesso" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {backup.status === "sucesso" ? "Sucesso" : "Erro"}
                        </Badge>
                        <Badge
                          className={`flex-shrink-0 border ${
                            backup.wasScheduled
                              ? "bg-purple-900 text-purple-200 border-purple-600"
                              : "bg-blue-900 text-blue-200 border-primary"
                          }`}
                          data-testid={`badge-backup-type-${backup.id}`}
                        >
                          {backup.wasScheduled ? "🤖 Agendado" : "👤 Manual"}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>
                          📅 {formatDate(new Date(backup.createdAt))} -{" "}
                          {new Date(backup.createdAt).toLocaleTimeString("pt-BR")}
                        </p>
                        <p>💾 Tamanho: {formatFileSize(backup.fileSize)}</p>
                        {backup.sentToTelegram && <p>📱 Enviado para Telegram</p>}
                        {backup.notes && <p>📝 {backup.notes}</p>}
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteBackupMutation.mutate(backup.id)}
                      disabled={deleteBackupMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-300 hover:bg-red-900/30 flex-shrink-0"
                      data-testid={`button-delete-backup-${backup.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nenhum backup registrado ainda</p>
              <p className="text-sm text-slate-500 mt-1">
                Clique em "Gerar Novo Backup" para criar o primeiro
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação Restore */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-900 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Restaurar Backup</DialogTitle>
            <DialogDescription className="text-slate-300">
              ⚠️ Esta ação irá sobrescrever todos os dados do banco de dados com os dados do backup.
              Certifique-se de que é isso que deseja fazer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-sm text-yellow-200">
                Os dados atuais do sistema serão substituídos pelos dados do arquivo de backup.
                Esta operação não pode ser desfeita facilmente.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                data-testid="button-cancel-restore"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRestoreConfirm}
                disabled={restoreBackupMutation.isPending}
                className="bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-500"
                data-testid="button-confirm-restore"
              >
                {restoreBackupMutation.isPending ? "Restaurando..." : "Confirmar Restauração"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Opções de Backup */}
      <Dialog open={showTelegramDialog} onOpenChange={setShowTelegramDialog}>
        <DialogContent className="bg-slate-900 border-2 border-blue-500">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Opções de Backup</DialogTitle>
            <DialogDescription className="text-slate-300">
              Configure como deseja gerar este backup
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded border border-slate-600 bg-slate-800/50">
              <input
                type="checkbox"
                id="sendTelegramCheckbox"
                checked={sendToTelegram}
                onChange={(e) => setSendToTelegram(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-blue-500"
                data-testid="checkbox-send-telegram"
              />
              <label htmlFor="sendTelegramCheckbox" className="flex-1 cursor-pointer text-slate-200 text-sm">
                Enviar também pelo Telegram
              </label>
            </div>
            <div className="p-4 bg-blue-900/20 border border-primary rounded-lg">
              <p className="text-sm text-blue-200">
                {sendToTelegram 
                  ? "O backup será gerado, baixado e enviado para Telegram com informações detalhadas."
                  : "O backup será apenas gerado e baixado para seu computador."}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowTelegramDialog(false)}
                data-testid="button-backup-cancel"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => generateBackupMutation.mutate()}
                disabled={generateBackupMutation.isPending}
                className="bg-primary hover:bg-blue-700 text-white border border-blue-500"
                data-testid="button-backup-generate"
              >
                {generateBackupMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Backup"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Criar/Editar Agendamento */}
      <Dialog open={showScheduleDialog || !!editingSchedule} onOpenChange={(open) => {
        if (!open) {
          setShowScheduleDialog(false);
          setEditingSchedule(null);
          setNewSchedule({ frequency: "diario", scheduledTime: "02:00", sendToTelegram: true });
        }
      }}>
        <DialogContent className="bg-slate-900 border-2 border-purple-500">
          <DialogHeader>
            <DialogTitle className="text-purple-400">
              {editingSchedule ? "Editar Agendamento" : "Novo Agendamento"}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Configure quando deseja que os backups automáticos sejam executados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Frequência</Label>
              <Select
                defaultValue={editingSchedule?.frequency || newSchedule.frequency}
                onValueChange={(value) => {
                  if (editingSchedule) {
                    setEditingSchedule({ ...editingSchedule, frequency: value });
                  } else {
                    setNewSchedule({ ...newSchedule, frequency: value });
                  }
                }}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="diario">Diariamente</SelectItem>
                  <SelectItem value="semanal">Semanalmente</SelectItem>
                  <SelectItem value="mensal">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Hora (UTC -3)</Label>
              <Input
                type="time"
                defaultValue={editingSchedule?.scheduledTime || newSchedule.scheduledTime}
                onChange={(e) => {
                  if (editingSchedule) {
                    setEditingSchedule({ ...editingSchedule, scheduledTime: e.target.value });
                  } else {
                    setNewSchedule({ ...newSchedule, scheduledTime: e.target.value });
                  }
                }}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="telegram"
                defaultChecked={editingSchedule?.sendToTelegram ?? newSchedule.sendToTelegram}
                onChange={(e) => {
                  if (editingSchedule) {
                    setEditingSchedule({ ...editingSchedule, sendToTelegram: e.target.checked });
                  } else {
                    setNewSchedule({ ...newSchedule, sendToTelegram: e.target.checked });
                  }
                }}
                className="w-4 h-4"
              />
              <Label htmlFor="telegram" className="text-slate-300 cursor-pointer">
                📱 Enviar para Telegram com arquivo e informações
              </Label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowScheduleDialog(false);
                  setEditingSchedule(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (editingSchedule) {
                    updateScheduleMutation.mutate({
                      frequency: editingSchedule.frequency,
                      scheduledTime: editingSchedule.scheduledTime,
                      sendToTelegram: editingSchedule.sendToTelegram,
                    });
                  } else {
                    createScheduleMutation.mutate(newSchedule);
                  }
                }}
                disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-500"
              >
                {editingSchedule ? "Atualizar" : "Criar Agendamento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Gerenciador de Backups */}
      <Dialog open={showBackupsModal} onOpenChange={setShowBackupsModal}>
        <DialogContent className="bg-slate-900 border-2 border-orange-500 max-w-2xl max-h-96 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <Folder className="w-5 h-5" />
              Gerenciador de Backups
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {backupFilesQuery.data?.count || 0} arquivo(s) encontrado(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {backupFilesQuery.data?.files && backupFilesQuery.data.files.length > 0 && (
              <div className="flex gap-2 pb-3 border-b border-slate-700">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSelectAll}
                  className={`border-slate-600 ${selectedBackups.size === backupFilesQuery.data.files.length && selectedBackups.size > 0 ? 'bg-primary text-white' : 'text-slate-300'}`}
                  data-testid="button-select-all-backups"
                >
                  {selectedBackups.size === backupFilesQuery.data.files.length && selectedBackups.size > 0 ? "✓ Todos Selecionados" : "Selecionar Todos"}
                </Button>
                {selectedBackups.size > 0 && (
                  <Button
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={deleteMultipleBackupsMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white border border-red-500"
                    data-testid="button-delete-selected-backups"
                  >
                    {deleteMultipleBackupsMutation.isPending ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                        Deletando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3 mr-2" />
                        Deletar {selectedBackups.size} Selecionado(s)
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {backupFilesQuery.data?.files && backupFilesQuery.data.files.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {backupFilesQuery.data.files.map((file: any) => (
                  <div
                    key={file.name}
                    className="p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-orange-500/50 transition-all flex items-center gap-3"
                    data-testid={`modal-backup-file-${file.name}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBackups.has(file.name)}
                      onChange={() => toggleBackupSelection(file.name)}
                      className="w-4 h-4 cursor-pointer"
                      data-testid={`checkbox-backup-${file.name}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-orange-300 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.modified).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        if (confirm(`Deletar ${file.name}?`)) {
                          deleteBackupFileMutation.mutate(file.name);
                        }
                      }}
                      disabled={deleteBackupFileMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-300 hover:bg-red-900/30 flex-shrink-0"
                      data-testid={`button-delete-single-file-${file.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Folder className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhum arquivo de backup</p>
                <p className="text-sm text-slate-500 mt-1">
                  Clique em "Gerar Novo Backup" para criar o primeiro
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
