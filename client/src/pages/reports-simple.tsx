import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { FinancialTransactionWithClient } from "@shared/schema";
import { generateFinancialReport } from "@/utils/pdfGeneratorSimple";

// Função para limpar descrições de transações
function getCleanDescription(description: string): string {
  if (!description) return "Nenhuma descrição disponível";
  
  // Split by lines and filter out JSON, discrimination sections
  const lines = description.split('\n');
  const cleanLines = lines.filter(line => 
    !line.includes('[{') &&
    !line.includes('}]') &&
    !line.includes('Discriminação de valores:') &&
    !line.includes('Serviços:') &&
    !line.includes('Produtos/Materiais:') &&
    !line.startsWith('- ') &&
    line.trim() !== ''
  );
  
  return cleanLines.join(' ').trim() || "Transação financeira";
}

export default function ReportsSimple() {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: transactions = [], isLoading } = useQuery<FinancialTransactionWithClient[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      console.log("=== GERANDO RELATÓRIO SIMPLES ===");
      console.log("Total de transações:", transactions.length);
      
      if (transactions.length === 0) {
        alert("Nenhuma transação encontrada para gerar o relatório.");
        return;
      }

      // Gerar relatório PDF
      await generateFinancialReport(transactions);
      
    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório: " + (error?.message || "Erro desconhecido"));
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center">Carregando dados...</div>
      </div>
    );
  }

  // Calcular estatísticas
  const entradas = transactions.filter(t => t.type === 'entrada');
  const saidas = transactions.filter(t => t.type === 'saida');
  const totalEntradas = entradas.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalSaidas = saidas.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Relatórios</h2>
          <p className="text-gray-600 dark:text-gray-400">Análises financeiras e exportação de dados</p>
        </div>
        <Button 
          onClick={generateReport} 
          disabled={isGenerating}
          className="bg-primary hover:bg-primary/90"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Gerando..." : "Exportar PDF"}
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalEntradas.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-gray-500">{entradas.length} transações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalSaidas.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-gray-500">{saidas.length} transações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldo.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-gray-500">Líquido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {transactions.length}
            </div>
            <p className="text-xs text-gray-500">Todas as transações</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{getCleanDescription(transaction.description || '')}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.client?.name || 'Cliente não informado'} • {' '}
                    {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'entrada' ? '+' : '-'}R$ {parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}