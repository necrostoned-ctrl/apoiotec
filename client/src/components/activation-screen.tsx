import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";

interface ActivationScreenProps {
  onActivated: () => void;
}

export function ActivationScreen({ onActivated }: ActivationScreenProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockedSeconds, setBlockedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (blockedSeconds > 0) {
      interval = setInterval(() => {
        setBlockedSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [blockedSeconds]);

  async function handleSubmit() {
    if (!password.trim()) {
      setError("Digite sua senha mestre");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/activation/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include"
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPassword("");
        onActivated();
      } else {
        // Mostrar erro com informações úteis
        let errorMsg = data.message || "Erro na ativação";
        if (data.remainingAttempts !== undefined) {
          errorMsg += ` (${data.remainingAttempts} tentativas restantes)`;
        }
        setError(errorMsg);
        
        // Quando bloqueado por rate limiting (429), mostrar contagem regressiva
        if (data.secondsLeft !== undefined && data.secondsLeft > 0) {
          console.log("⏱️ Bloqueio ativado por", data.secondsLeft, "segundos");
          setBlockedSeconds(data.secondsLeft);
        }
      }
    } catch (err) {
      setError("Erro ao ativar o sistema");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md border-2 border-cyan-500 bg-slate-900 shadow-2xl shadow-cyan-500/50">
        <CardHeader className="border-b border-cyan-500 bg-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-8 h-8 text-cyan-500" />
            <CardTitle className="text-2xl font-bold text-cyan-400">Ativação do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2">
                Senha Mestre
              </label>
              <Input
                type="password"
                placeholder="Digite sua senha de ativação"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !blockedSeconds && handleSubmit()}
                disabled={blockedSeconds > 0 || loading}
                className="bg-slate-800 border-2 border-cyan-500 text-cyan-100 placeholder:text-slate-500 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {blockedSeconds > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-500 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-yellow-300">
                  Tente novamente em {blockedSeconds}s
                </span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={blockedSeconds > 0 || loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-black font-bold border border-cyan-400 shadow-lg shadow-cyan-500/50 disabled:opacity-50"
            >
              {loading ? "Ativando..." : blockedSeconds > 0 ? `Aguarde ${blockedSeconds}s` : "Ativar Sistema"}
            </Button>

            <div className="p-3 bg-slate-800 border border-cyan-500/30 rounded-lg">
              <p className="text-xs text-slate-300">
                <CheckCircle className="w-4 h-4 inline mr-2 text-cyan-400" />
                Seu sistema será ativado apenas para este computador.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
