import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wrench, FileText, Receipt } from "lucide-react";

interface NextStepsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectStep: (step: string) => void;
}

export function NextStepsModal({ open, onOpenChange, onSelectStep }: NextStepsModalProps) {
  const steps = [
    {
      id: "services",
      title: "Serviços em Aberto",
      description: "Iniciar trabalho no equipamento",
      icon: Wrench,
      color: "bg-warning/10 text-warning",
    },
    {
      id: "quotes",
      title: "Gerar Orçamento",
      description: "Criar orçamento para aprovação",
      icon: FileText,
      color: "bg-primary/10 text-primary",
    },
    {
      id: "invoice",
      title: "Emitir Nota Fiscal",
      description: "Serviço concluído, emitir NF",
      icon: Receipt,
      color: "bg-success/10 text-success",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-2 border-purple-500 shadow-2xl shadow-purple-500/30">
        <DialogHeader className="border-b-2 border-purple-500 pb-3">
          <DialogTitle className="text-white text-xl">🎯 Próximos Passos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Para onde deseja direcionar este chamado?
          </p>
          
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Button
                key={step.id}
                variant="ghost"
                className="w-full p-4 h-auto justify-start bg-black border border-slate-700 hover:border-purple-500/50 hover:bg-slate-900 text-white"
                onClick={() => {
                  onSelectStep(step.id);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${step.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">{step.title}</div>
                    <div className="text-sm text-gray-400">
                      {step.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
