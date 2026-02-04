import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Bell, Zap, FileText, Trash2, MoreHorizontal, Check, X } from "lucide-react";

export interface NotificationPreference {
  key: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
}

interface NotificationSettingsProps {
  preferences: Record<string, boolean>;
  onToggle: (key: string) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationSettingsCompactProps extends NotificationSettingsProps {
  compact?: boolean;
}

export function NotificationSettings({
  preferences,
  onToggle,
  onEnableAll,
  onDisableAll,
  isOpen,
  onOpenChange,
  compact = false,
}: NotificationSettingsCompactProps) {
  const notificationTypes: NotificationPreference[] = [
    {
      key: "financial_discount",
      label: "Desconto Aplicado",
      description: "Ao aplicar desconto",
      icon: Zap,
      enabled: preferences.financial_discount,
    },
    {
      key: "financial_installment",
      label: "Parcela Registrada",
      description: "Ao registrar parcela",
      icon: FileText,
      enabled: preferences.financial_installment,
    },
    {
      key: "financial_payment",
      label: "Pagamento Registrado",
      description: "Ao registrar pagamento",
      icon: Check,
      enabled: preferences.financial_payment,
    },
    {
      key: "financial_pdf",
      label: "PDF Gerado",
      description: "Ao gerar recibo/nota",
      icon: FileText,
      enabled: preferences.financial_pdf,
    },
    {
      key: "financial_deleted",
      label: "Transação Excluída",
      description: "Ao excluir transação",
      icon: Trash2,
      enabled: preferences.financial_deleted,
    },
  ];

  const enabledCount = Object.values(preferences).filter(Boolean).length;
  const totalCount = Object.keys(preferences).length;

  // Modo compacto para Settings (não dropdown)
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificações Financeiras
          </h3>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
            {enabledCount}/{totalCount} ativas
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onEnableAll}
            className="flex-1 text-sm"
            data-testid="button-enable-all-notifications"
          >
            <Check className="w-4 h-4 mr-2" />
            Ativar Todas
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDisableAll}
            className="flex-1 text-sm"
            data-testid="button-disable-all-notifications"
          >
            <X className="w-4 h-4 mr-2" />
            Desativar Todas
          </Button>
        </div>

        {/* Notification Types Grid - 2-3 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {notificationTypes.map((notif) => {
            const Icon = notif.icon;
            return (
              <Card
                key={notif.key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  notif.enabled
                    ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50"
                }`}
                onClick={() => onToggle(notif.key)}
                data-testid={`card-notification-${notif.key}`}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        notif.enabled
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {notif.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {notif.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                        notif.enabled
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 dark:border-slate-600"
                      }`}
                    >
                      {notif.enabled && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>💡 As notificações serão enviadas via Telegram quando habilitadas</p>
        </div>
      </div>
    );
  }

  // Modo dropdown para Financeiro
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenChange(!isOpen)}
        className="gap-2 text-sm"
        data-testid="button-notification-settings"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden sm:inline">Notificações</span>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full">
          {enabledCount}/{totalCount}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-96 bg-background dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg p-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Configurações de Notificação
              </h3>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onEnableAll}
                className="flex-1 text-xs"
                data-testid="button-enable-all-notifications"
              >
                <Check className="w-3 h-3 mr-1" />
                Ativar Todas
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDisableAll}
                className="flex-1 text-xs"
                data-testid="button-disable-all-notifications"
              >
                <X className="w-3 h-3 mr-1" />
                Desativar Todas
              </Button>
            </div>

            {/* Notification Types Grid - 2 columns */}
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {notificationTypes.map((notif) => {
                const Icon = notif.icon;
                return (
                  <Card
                    key={notif.key}
                    className={`cursor-pointer transition-all ${
                      notif.enabled
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                    }`}
                    onClick={() => onToggle(notif.key)}
                    data-testid={`card-notification-${notif.key}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded ${
                              notif.enabled
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-slate-400"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                              {notif.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {notif.description}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            notif.enabled
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 dark:border-slate-600"
                          }`}
                        >
                          {notif.enabled && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-3 text-xs text-gray-500 dark:text-gray-400">
              <p>
                {enabledCount} de {totalCount} notificações ativas
              </p>
              <p className="mt-1">As notificações serão enviadas via Telegram</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
