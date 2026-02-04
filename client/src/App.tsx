import React, { Suspense, useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/components/SettingsProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { BottomNav } from "@/components/bottom-nav";
import Login from "@/pages/login";

// Lazy Loading com cast 'as any' para evitar alertas de tipagem no Cursor
const Dashboard = React.lazy(() => import("@/pages/dashboard")) as any;
const NewCall = React.lazy(() => import("@/pages/new-call")) as any;
const TodayCalls = React.lazy(() => import("@/pages/today-calls")) as any;
const Calls = React.lazy(() => import("@/pages/calls")) as any;
const Services = React.lazy(() => import("@/pages/services")) as any;
const Quotes = React.lazy(() => import("@/pages/quotes")) as any;
const Clients = React.lazy(() => import("@/pages/clients")) as any;
const Inventory = React.lazy(() => import("@/pages/inventory")) as any;
const KnowledgeBase = React.lazy(() => import("@/pages/knowledge-base")) as any;
const PreventiveMaintenance = React.lazy(() => import("@/pages/preventive-maintenance")) as any;
const DigitalCertificates = React.lazy(() => import("@/pages/digital-certificates")) as any;
const Reports = React.lazy(() => import("@/pages/reports")) as any;
const ReportsCliente = React.lazy(() => import("@/pages/reports-cliente")) as any;
const ReportsDiversos = React.lazy(() => import("@/pages/reports-diversos")) as any;
const ReportsServicos = React.lazy(() => import("@/pages/reports-servicos")) as any;
const Financial = React.lazy(() => import("@/pages/financial")) as any;
const Downloads = React.lazy(() => import("@/pages/downloads")) as any;
const Messages = React.lazy(() => import("@/pages/messages")) as any;
const Users = React.lazy(() => import("@/pages/users")) as any;
const Templates = React.lazy(() => import("@/pages/templates-fixed")) as any;
const Settings = React.lazy(() => import("@/pages/settings")) as any;
const NotFound = React.lazy(() => import("@/pages/not-found")) as any;

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // ✅ BYPASS: Travado em true para ignorar a verificação de hardware
  const [isActivated] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden font-sans">
      <MobileNav onMenuClick={() => setSidebarOpen(true)} currentUser={currentUser} onLogout={handleLogout} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto p-4 pt-20 pb-40 lg:pb-12">
        <Suspense fallback={
          <div className="flex h-full items-center justify-center bg-black">
            <div className="text-cyan-500 font-mono animate-pulse">CARREGANDO SISTEMA APOIOTEC...</div>
          </div>
        }>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/new-call">{() => <NewCall currentUser={currentUser} />}</Route>
            <Route path="/today-calls" component={TodayCalls} />
            <Route path="/calls">{() => <Calls currentUser={currentUser} />}</Route>
            <Route path="/services">{() => <Services currentUser={currentUser} />}</Route>
            <Route path="/quotes" component={Quotes} />
            <Route path="/clients" component={Clients} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/knowledge-base">{() => <KnowledgeBase currentUser={currentUser} />}</Route>
            <Route path="/preventive-maintenance">{() => <PreventiveMaintenance currentUser={currentUser} />}</Route>
            <Route path="/financial">{() => <Financial currentUser={currentUser} />}</Route>
            <Route path="/reports" component={Reports} />
            {/* ✅ ROTAS ESPECÍFICAS DE RELATÓRIOS PARA CORRIGIR O 404 */}
            <Route path="/reports/cliente">{() => <ReportsCliente currentUser={currentUser} />}</Route>
            <Route path="/reports/diversos">{() => <ReportsDiversos currentUser={currentUser} />}</Route>
            <Route path="/reports/servicos">{() => <ReportsServicos currentUser={currentUser} />}</Route>
            <Route path="/downloads" component={Downloads} />
            <Route path="/messages" component={Messages} />
            <Route path="/users" component={Users} />
            <Route path="/templates" component={Templates} />
            <Route path="/digital-certificates" component={DigitalCertificates} />
            <Route path="/settings">{() => <Settings currentUser={currentUser} />}</Route>
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}