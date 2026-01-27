import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Users() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to settings/users tab
    setLocation("/settings?tab=users");
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecionando para Configurações...</p>
    </div>
  );
}
