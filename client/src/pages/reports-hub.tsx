import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, TrendingUp } from "lucide-react";

export default function ReportsHub() {
  console.log("🔵 [REPORTS-HUB] Renderizando Hub de Relatórios");

  const reportOptions = [
    {
      title: "Relatórios por Cliente",
      description: "Gere relatórios de serviços filtrados por cliente, período e tipo de serviço",
      icon: FileText,
      href: "/reports-cliente",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Relatórios por Serviços",
      description: "Visualize um resumo detalhado de todos os serviços com gráficos e dados",
      icon: BarChart3,
      href: "/reports-servicos",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Relatórios Diversos",
      description: "Análises financeiras, gráficos de tendências e relatórios gerenciais",
      icon: TrendingUp,
      href: "/reports-diversos",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-neon bg-gradient-to-r from-neon/20 to-neon/10 backdrop-blur border-neon/50">
        <CardHeader>
          <CardTitle className="text-neon text-center text-3xl font-bold">
            🦁 Centro de Relatórios
          </CardTitle>
          <p className="text-neon text-center mt-3 font-medium">
            Selecione o tipo de relatório que deseja gerar
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportOptions.map((option, index) => {
          const Icon = option.icon;
          console.log(`🟡 [BUTTON-${index}] Renderizando botão: ${option.title} → ${option.href}`);
          
          return (
            <Link 
              key={index} 
              href={option.href}
              onClick={(e) => {
                console.log(`🟢 [CLICK-${index}] Link clicado: ${option.title} navegando para ${option.href}`);
              }}
            >
              <Card 
                className="border-neon bg-black/40 backdrop-blur hover:border-neon hover:bg-black/50 transition-all hover:shadow-lg hover:shadow-neon/40 cursor-pointer group h-full flex flexlex-col"
                onClick={(e) => {
                  console.log(`🔴 [CARD-CLICK-${index}] Card clicado`);
                }}
              >
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className={`bg-gradient-to-br ${option.color} p-4 rounded-lg mb-4 w-fit group-hover:scale-110 transition-transform shadow-lg shadow-neon/30`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-3 text-neon">
                      {option.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-6">
                      {option.description}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full bg-neon text-black hover:bg-neon/80 font-bold text-base shadow-lg shadow-neon/40 hover:shadow-neon/70 transition-all"
                    asChild
                    onClick={(e) => {
                      console.log(`🟣 [BUTTON-CLICK-${index}] Botão clicado: ${option.title}`);
                    }}
                  >
                    <a href={option.href} onClick={(e) => {
                      console.log(`🟠 [LINK-CLICK-${index}] Link do botão clicado para ${option.href}`);
                    }}>Acessar</a>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
