import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Home,
  PlusCircle,
  Phone,
  Wrench,
  FileText,
  Users,
  TrendingUp,
  BarChart3,
  Download,
  MessageSquare,
  Send,
  Shield,
  X,
  LogOut,
  User,
  Sun,
  Moon,
  Settings,
  Bell,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

import { Package } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Novo Chamado", href: "/new-call", icon: PlusCircle },
  { name: "Chamados em Aberto", href: "/calls", icon: Phone },
  { name: "Serviços em Andamento", href: "/services", icon: Wrench },
  { name: "Orçamentos", href: "/quotes", icon: FileText },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Estoque", href: "/inventory", icon: Package },
  { name: "Base de Conhecimento", href: "/knowledge-base", icon: BookOpen },
  { name: "Manutenção Preventiva", href: "/preventive-maintenance", icon: AlertCircle },
  { name: "Financeiro", href: "/financial", icon: TrendingUp },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Downloads", href: "/downloads", icon: Download },
  { name: "Anotações", href: "/messages", icon: MessageSquare },
  { name: "Certificados Digitais", href: "/digital-certificates", icon: Shield },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose, currentUser, onLogout }: SidebarProps) {
  const [location] = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >


        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-6 py-3 text-white hover:bg-blue-800 hover:text-accent transition-colors cursor-pointer",
                    isActive && "border-r-4 border-accent bg-blue-800"
                  )}
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info, theme toggle and logout */}
        {currentUser && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name || currentUser.username}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {currentUser.role || "Conectado"}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-gray-800"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 mr-2" />
                ) : (
                  <Moon className="h-4 w-4 mr-2" />
                )}
                {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
              </Button>
              
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair do Sistema
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
