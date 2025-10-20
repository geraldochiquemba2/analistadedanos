import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export type DamageSeverity = "low" | "moderate" | "high";

interface DamageItemCardProps {
  itemName: string;
  itemType?: string;
  severity: DamageSeverity;
  description: string;
  estimatedImpact?: string;
  priceNew?: string;
  priceUsed?: string;
  repairCost?: string;
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
  priceNew,
  priceUsed,
  repairCost,
}: DamageItemCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  const hasPricing = priceNew || priceUsed || repairCost;

  return (
    <Card className="hover-elevate" data-testid={`card-damage-${itemName.toLowerCase().replace(/\s/g, "-")}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
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
        
        {hasPricing && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Custos Estimados</h4>
              </div>
              <div className="grid grid-cols-1 gap-2 pl-6">
                {priceNew && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Preço Novo:</span>
                    <span className="text-sm font-medium" data-testid="text-price-new">{priceNew}</span>
                  </div>
                )}
                {priceUsed && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Preço Usado:</span>
                    <span className="text-sm font-medium" data-testid="text-price-used">{priceUsed}</span>
                  </div>
                )}
                {repairCost && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Custo de Reparo:</span>
                    <span className="text-sm font-medium text-primary" data-testid="text-repair-cost">{repairCost}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
