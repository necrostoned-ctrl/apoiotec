const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(process.cwd(), 'client', 'src', 'App.tsx');

const FINAL_APP_CODE = `
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

// Lazy Loading para economizar RAM no Fly.io
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const NewCall = React.lazy(() => import("@/pages/new-call"));
const Calls = React.lazy(() => import("@/pages/calls"));
const Services = React.lazy(() => import("@/pages/services"));
const Financial = React.lazy(() => import("@/pages/financial"));
const Clients = React.lazy(() => import("@/pages/clients"));
const Inventory = React.lazy(() => import("@/pages/inventory"));
const Settings = React.lazy(() => import("@/pages/settings"));
const NotFound = React.lazy(() => import("@/pages/not-found"));

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // ✅ BYPASS: Travamos em 'true' para nunca mais ver "Verificando Ativação"
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
        <Suspense fallback={<div className="text-cyan-500 font-mono p-10 text-center animate-pulse">CARREGANDO MÓDULO APOIOTEC...</div>}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/new-call">{(params) => <NewCall currentUser={currentUser} />}</Route>
            <Route path="/calls" component={Calls} />
            <Route path="/services" component={Services} />
            <Route path="/clients" component={Clients} />
            <Route path="/financial" component={Financial} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/settings" component={Settings} />
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
`;

try {
    fs.writeFileSync(APP_PATH, FINAL_APP_CODE);
    console.log("🚀 [APOIOTEC] App.tsx atualizado com sucesso!");
    console.log("✅ Trava de ativação removida e erro de rotas corrigido.");
} catch (err) {
    console.error("❌ Erro ao escrever arquivo: " + err.message);
}