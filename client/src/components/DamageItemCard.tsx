import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export type DamageSeverity = "low" | "moderate" | "high";

interface DamageItemCardProps {
  itemName: string;
  itemType?: string;
  severity: DamageSeverity;
  description: string;
  estimatedImpact?: string;
}

const severityConfig = {
  low: {
    label: "Leve",
    variant: "default" as const,
    color: "text-chart-3",
    icon: Info,
  },
  moderate: {
    label: "Moderado",
    variant: "secondary" as const,
    color: "text-chart-4",
    icon: AlertTriangle,
  },
  high: {
    label: "Grave",
    variant: "destructive" as const,
    color: "text-destructive",
    icon: AlertCircle,
  },
};

export function DamageItemCard({
  itemName,
  itemType,
  severity,
  description,
  estimatedImpact,
}: DamageItemCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Card className="hover-elevate" data-testid={`card-damage-${itemName.toLowerCase().replace(/\s/g, "-")}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{itemName}</CardTitle>
            {itemType && (
              <p className="text-sm text-muted-foreground mt-1">{itemType}</p>
            )}
          </div>
          <Badge variant={config.variant} className="shrink-0">
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-1">Descrição do Dano:</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {estimatedImpact && (
          <div>
            <h4 className="text-sm font-medium mb-1">Impacto Estimado:</h4>
            <p className="text-sm text-muted-foreground">{estimatedImpact}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
