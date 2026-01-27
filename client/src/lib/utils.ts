import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(dateObj);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "concluido":
    case "pago":
    case "pronto":
      return "bg-green-900/40 dark:bg-green-900/60 text-green-300 dark:text-green-200 border-2 border-green-400 dark:border-green-300 shadow-lg shadow-green-500/30";
    case "em-andamento":
    case "aguardando":
    case "pendente":
      return "bg-yellow-900/40 dark:bg-yellow-900/60 text-yellow-300 dark:text-yellow-200 border-2 border-yellow-400 dark:border-yellow-300 shadow-lg shadow-yellow-500/30";
    case "parcial":
      return "bg-blue-900/40 dark:bg-blue-900/60 text-blue-300 dark:text-blue-200 border-2 border-blue-400 dark:border-blue-300 shadow-lg shadow-blue-500/30";
    case "parcelado":
      return "bg-purple-900/40 dark:bg-purple-900/60 text-purple-300 dark:text-purple-200 border-2 border-purple-400 dark:border-purple-300 shadow-lg shadow-purple-500/30";
    case "cancelado":
      return "bg-red-900/40 dark:bg-red-900/60 text-red-300 dark:text-red-200 border-2 border-red-400 dark:border-red-300 shadow-lg shadow-red-500/30";
    case "aguardando-produto":
      return "bg-orange-900/40 dark:bg-orange-900/60 text-orange-300 dark:text-orange-200 border-2 border-orange-400 dark:border-orange-300 shadow-lg shadow-orange-500/30";
    default:
      return "bg-gray-900/40 dark:bg-gray-900/60 text-gray-300 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-300 shadow-lg shadow-gray-500/30";
  }
}

export function getStatusLabel(status: string, transaction?: any): string {
  const statusMap: Record<string, string> = {
    "aguardando": "Aguardando",
    "em-andamento": "Em Andamento",
    "aguardando-produto": "Aguardando Produto",
    "pronto": "Pronto",
    "concluido": "Concluído",
    "cancelado": "Cancelado",
    "pendente": "Pendente",
    "parcial": "Parcial",
    "pago": "Pago",
    "parcelado": "Parcelado",
  };
  
  // Se for uma transação com parcelas, calcular status dinâmico
  if (transaction && transaction.childTransactions && transaction.childTransactions.length > 0) {
    // CORREÇÃO: Somar apenas parcelas que estão PAGAS
    const totalPaid = transaction.childTransactions
      .filter((child: any) => child.status === "pago")
      .reduce((sum: number, child: any) => 
        sum + parseFloat(child.amount.toString()), 0
      );
    const parentAmount = parseFloat(transaction.amount.toString());
    
    if (totalPaid >= parentAmount) {
      return "Pago";
    } else if (totalPaid > 0) {
      return "Parcial";
    } else {
      // Se status original é "parcelado" e nenhuma parcela foi paga
      return status === "parcelado" ? "Parcelado" : "Pendente";
    }
  }
  
  return statusMap[status] || status;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgente":
      return "bg-red-900/40 dark:bg-red-900/60 text-red-300 dark:text-red-200 border-2 border-red-400 dark:border-red-300 shadow-lg shadow-red-500/30";
    case "alta":
      return "bg-orange-900/40 dark:bg-orange-900/60 text-orange-300 dark:text-orange-200 border-2 border-orange-400 dark:border-orange-300 shadow-lg shadow-orange-500/30";
    case "media":
      return "bg-yellow-900/40 dark:bg-yellow-900/60 text-yellow-300 dark:text-yellow-200 border-2 border-yellow-400 dark:border-yellow-300 shadow-lg shadow-yellow-500/30";
    case "baixa":
      return "bg-green-900/40 dark:bg-green-900/60 text-green-300 dark:text-green-200 border-2 border-green-400 dark:border-green-300 shadow-lg shadow-green-500/30";
    default:
      return "bg-gray-900/40 dark:bg-gray-900/60 text-gray-300 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-300 shadow-lg shadow-gray-500/30";
  }
}

export function getPriorityLabel(priority: string): string {
  const priorityMap: Record<string, string> = {
    "urgente": "Urgente",
    "alta": "Alta",
    "media": "Média",
    "baixa": "Baixa",
  };
  return priorityMap[priority] || priority;
}
