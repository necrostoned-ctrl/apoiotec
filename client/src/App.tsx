import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/components/SettingsProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";
import { ActivationScreen } from "@/components/activation-screen";
import { apiRequest } from "@/lib/queryClient";

// Components
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { BottomNav } from "@/components/bottom-nav";

// Pages
import Dashboard from "@/pages/dashboard";
import NewCall from "@/pages/new-call";
import TodayCalls from "@/pages/today-calls";
import Calls from "@/pages/calls";
import Services from "@/pages/services";
import Quotes from "@/pages/quotes";
import Clients from "@/pages/clients";
import Financial from "@/pages/financial";
import Reports from "@/pages/reports";
import ReportsSimple from "@/pages/reports-simple";
import ReportsEnhanced from "@/pages/reports-enhanced";
import ReportsHub from "@/pages/reports-hub";
import ReportsCliente from "@/pages/reports-cliente";
import ReportsServicos from "@/pages/reports-servicos";
import ReportsDiversos from "@/pages/reports-diversos";
import Downloads from "@/pages/downloads";
import Messages from "@/pages/messages";

import Users from "@/pages/users";
import Templates from "@/pages/templates-fixed";
import EnhancedTemplates from "@/pages/enhanced-templates";
// import SimpleTemplates from "@/pages/simple-templates";
import Settings from "@/pages/settings";
import Inventory from "@/pages/inventory";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import KnowledgeBase from "@/pages/knowledge-base";
import PreventiveMaintenance from "@/pages/preventive-maintenance";
import DigitalCertificates from "@/pages/digital-certificates";

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isActivated, setIsActivated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkActivation = async () => {
      try {
        const response = await fetch("/api/activation/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        const data = await response.json();
        console.log("📱 [CLIENTE] Resposta de verificação de ativação:", data);
        
        // 🔴 CONFIA SEMPRE NA RESPOSTA DO SERVIDOR
        // Se o servidor diz que está ativado, permite acesso
        if (data.status === "activated" || data.activated === true) {
          console.log("✅ [CLIENTE] Sistema LIBERADO - Hardware verificado no servidor");
          localStorage.setItem("systemActivated", "true");
          setIsActivated(true);
        } 
        // Se hardware mudou, pede senha novamente (independente do localStorage)
        else if (data.status === "hardware_changed") {
          console.log("⚠️ [CLIENTE] Hardware foi alterado - Precisa de senha mestra");
          localStorage.removeItem("systemActivated");
          setIsActivated(false);
        } 
        // Se não está ativado, pede senha
        else if (data.status === "not_activated") {
          console.log("🔐 [CLIENTE] Sistema não ativado - Precisa de senha mestra");
          localStorage.removeItem("systemActivated");
          setIsActivated(false);
        } 
        // Se está bloqueado por rate limiting
        else if (data.status === "blocked") {
          console.log("⏱️  [CLIENTE] Sistema BLOQUEADO por rate limiting por", data.secondsLeft, "segundos");
          setIsActivated(false);
        } 
        else {
          setIsActivated(false);
        }
      } catch (error) {
        console.error("Erro ao verificar ativação:", error);
        setIsActivated(false);
      }
    };

    checkActivation();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        console.log("✅ [APP] Usuário carregado do localStorage:", { id: parsed?.id, name: parsed?.name || parsed?.username });
      } catch (error) {
        console.error("Erro ao carregar usuário salvo:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleLogin = (user: any) => {
    console.log("✅ [APP] Login efetuado:", { id: user?.id, name: user?.name || user?.username });
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  // Verificar ativação do sistema
  if (isActivated === null) {
    return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="text-cyan-400">Verificando ativação...</div></div>;
  }

  if (!isActivated) {
    return <ActivationScreen onActivated={() => setIsActivated(true)} />;
  }

  // Sistema de autenticação ativo
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black overflow-hidden">
      <MobileNav 
        onMenuClick={() => setSidebarOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-20 pb-40 lg:pb-12 scroll-smooth"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/new-call" component={() => <NewCall currentUser={currentUser} />} />
            <Route path="/today-calls" component={TodayCalls} />
            <Route path="/calls" component={() => <Calls currentUser={currentUser} />} />
            <Route path="/services" component={() => <Services currentUser={currentUser} />} />
            <Route path="/quotes" component={() => <Quotes currentUser={currentUser} />} />
            <Route path="/clients" component={() => <Clients currentUser={currentUser} />} />
            <Route path="/knowledge-base" component={() => <KnowledgeBase currentUser={currentUser} />} />
            <Route path="/preventive-maintenance" component={() => <PreventiveMaintenance currentUser={currentUser} />} />
            <Route path="/financial" component={() => <Financial currentUser={currentUser} />} />
            <Route path="/reports" component={Reports} />
            <Route path="/reports/cliente" component={ReportsCliente} />
            <Route path="/reports/diversos" component={ReportsDiversos} />
            <Route path="/reports/servicos" component={ReportsServicos} />
            <Route path="/downloads" component={Downloads} />
            <Route path="/messages" component={Messages} />

            <Route path="/users" component={Users} />
            <Route path="/settings">
              {() => <Settings currentUser={currentUser} />}
            </Route>
            <Route path="/inventory" component={Inventory} />
            <Route path="/templates" component={Templates} />
            <Route path="/digital-certificates" component={DigitalCertificates} />
            <Route component={NotFound} />
          </Switch>
      </main>
      
      {/* Bottom Navigation - sempre visível */}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-black">
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </div>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
