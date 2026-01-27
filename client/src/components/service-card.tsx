import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Edit } from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import type { CallWithClient } from "@shared/schema";

interface ServiceCardProps {
  service: CallWithClient;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
}

export function ServiceCard({ service, onView, onEdit }: ServiceCardProps) {
  const statusColor = getStatusColor(service.status);
  const priorityColor = getPriorityColor(service.priority);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              #{service.id.toString().padStart(3, "0")} - {service.client.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{service.equipment}</p>
          </div>
          <Badge variant={statusColor as any}>
            {getStatusLabel(service.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm">
              <strong>Serviço:</strong> {service.serviceType}
            </p>
            <p className="text-sm">
              <strong>Prioridade:</strong>{" "}
              <Badge variant={priorityColor as any} className="text-xs">
                {getPriorityLabel(service.priority)}
              </Badge>
            </p>
            <p className="text-sm">
              <strong>Entrada:</strong> {formatDate(service.createdAt)}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>{service.progress || 0}%</span>
            </div>
            <Progress value={service.progress || 0} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onEdit(service.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(service.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
