import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
      <Card className="w-full max-w-md mx-4 bg-slate-800 border-2 border-cyan-500">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-cyan-300">404 Página Não Encontrada</h1>
          </div>

          <p className="mt-4 text-sm text-cyan-100">
            Você esqueceu de adicionar a página ao roteador?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
