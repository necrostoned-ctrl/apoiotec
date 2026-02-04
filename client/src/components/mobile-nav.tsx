import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, Sun, Moon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/components/ThemeProvider";

interface MobileNavProps {
  onMenuClick: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

export function MobileNav({ onMenuClick, currentUser, onLogout }: MobileNavProps) {
  const { theme, toggleTheme } = useTheme();

  // Buscar nome da empresa das configurações
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    staleTime: Infinity,
  });
  return (
    <div className="bg-primary text-white p-4 flex justify-between items-center dark:bg-[#1e3a8a]">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-accent"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{settings?.companyName || "Apoiotec Informática"}</h1>
      </div>
      
      {/* User info and logout for mobile */}
      {currentUser && onLogout && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-background/20 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {currentUser.name || currentUser.username}
            </span>
          </div>
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-background/20"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={onLogout}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-background/20"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
