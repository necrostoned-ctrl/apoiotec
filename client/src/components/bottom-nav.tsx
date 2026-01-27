import { Link, useLocation } from "wouter";
import { Home, Phone, Wrench, DollarSign, BarChart3 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";

const navItems = [
  { path: "/", icon: Home, label: "Início", color: "blue" },
  { path: "/calls", icon: Phone, label: "Chamados", color: "blue" },
  { path: "/services", icon: Wrench, label: "Serviços", color: "blue" },
  { path: "/financial", icon: DollarSign, label: "Financeiro", color: "blue" },
  { path: "/reports", icon: BarChart3, label: "Relatórios", color: "blue" },
];

const neonColors: Record<string, { icon: string; text: string; bg: string; border: string; shadow: string }> = {
  blue: {
    icon: "text-blue-400",
    text: "text-blue-300",
    bg: "bg-blue-900/30",
    border: "border-blue-500",
    shadow: "shadow-blue-500/50"
  }
};

export function BottomNav() {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      const currentScrollY = window.scrollY;
      
      // Mostrar barra ao rolar para cima ou perto do topo
      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } 
      // Esconder barra ao rolar para baixo (após rolar 100px)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        scrollTimeout = setTimeout(() => {
          setIsVisible(false);
        }, 150);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollY]);

  const navStyle: CSSProperties = {
    display: 'block',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms ease-in-out',
    transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
    boxShadow: isVisible ? '0 -8px 24px rgba(0, 0, 0, 0.15)' : 'none'
  };

  return (
    <div 
      className="bg-black dark:bg-slate-950 border-t-2 border-slate-800"
      style={navStyle}
    >
      <div className="grid grid-cols-5 h-16 gap-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          const colors = neonColors[item.color];
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200 p-2 ${
                isActive 
                  ? `${colors.bg} border-b-4 ${colors.border} shadow-lg ${colors.shadow}`
                  : "border-b-4 border-transparent"
              }`}
            >
              <Icon className={`h-6 w-6 font-bold ${colors.icon}`} />
              <span className={`text-xs font-bold ${isActive ? colors.text : colors.icon}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}