import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "destructive";
}

export function StatsCard({ title, value, icon: Icon, variant = "primary" }: StatsCardProps) {
  const variantStyles = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
  };

  return (
    <Card>
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className={cn("text-xl md:text-3xl font-bold", `text-${variant}`)}>{value}</p>
          </div>
          <div className={cn("p-2 md:p-3 rounded-lg flex-shrink-0", variantStyles[variant])}>
            <Icon className="h-4 w-4 md:h-6 md:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
