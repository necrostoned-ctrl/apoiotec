import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface SystemSettings {
  fontSize: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Buscar configurações do backend
  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ["/api/settings"],
    staleTime: Infinity, // Configurações não mudam com frequência
  });

  useEffect(() => {
    // Função para aplicar configurações no CSS
    const applySettings = (newSettings: SystemSettings) => {
      const root = document.documentElement;
      
      // Normalizar fontSize usando parseFloat para remover TODAS as unidades
      const fontSizeNum = parseFloat(String(newSettings.fontSize));
      const fontSize = isNaN(fontSizeNum) ? '22' : fontSizeNum.toString();
      
      // Aplicar tamanho da fonte com unidade
      root.style.setProperty('--base-font-size', `${fontSize}px`);
      
      // Aplicar família da fonte
      const fontMap: { [key: string]: string } = {
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        inter: '"Inter", sans-serif',
        roboto: '"Roboto", sans-serif',
        opensans: '"Open Sans", sans-serif',
        arial: 'Arial, sans-serif',
        helvetica: 'Helvetica, Arial, sans-serif',
      };
      root.style.setProperty('--font-family', fontMap[newSettings.fontFamily] || fontMap.system);
      
      // Aplicar cores
      root.style.setProperty('--primary-color', newSettings.primaryColor);
      root.style.setProperty('--secondary-color', newSettings.secondaryColor);
      
      // Salvar no localStorage (normalizar fontSize antes de salvar)
      const normalizedSettings = {
        ...newSettings,
        fontSize: fontSize, // Salvar sem unidade
      };
      localStorage.setItem('systemSettings', JSON.stringify(normalizedSettings));
      
      console.log("Configurações aplicadas:", normalizedSettings);
    };

    // 1. Tentar carregar do localStorage primeiro (para aplicação instantânea)
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        applySettings(parsed);
      } catch (e) {
        console.error("Erro ao carregar configurações do localStorage:", e);
      }
    }

    // 2. Aplicar configurações do backend quando carregarem
    if (settings) {
      applySettings(settings);
    }
  }, [settings]);

  return <>{children}</>;
}
