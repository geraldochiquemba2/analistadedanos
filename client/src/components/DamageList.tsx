import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AlertTriangle, Info, FileText, DollarSign } from "lucide-react";
import type { DamageItem } from "./AnalysisResult";

interface DamageListProps {
  damageItems: DamageItem[];
  title?: string;
}

const severityConfig = {
  low: {
    label: "Leve",
    variant: "default" as const,
    icon: Info,
  },
  moderate: {
    label: "Moderado",
    variant: "secondary" as const,
    icon: AlertTriangle,
  },
  high: {
    label: "Grave",
    variant: "destructive" as const,
    icon: AlertCircle,
  },
};

export function DamageList({ damageItems, title = "Lista Completa de Danos Identificados" }: DamageListProps) {
  return (
    <div className="space-y-4 w-full" data-testid="damage-list">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">
          {title} ({damageItems.length})
        </h2>
      </div>

      <div className="space-y-3 w-full">
        {damageItems.map((item, index) => {
          const config = severityConfig[item.severity];
          const Icon = config.icon;
          
          return (
            <Card 
              key={index} 
              className="hover-elevate" 
              data-testid={`damage-item-${index}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Badge variant={config.variant} className="shrink-0">
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg" data-testid={`text-item-name-${index}`}>
                      {item.itemName}
                    </CardTitle>
                    {item.itemType && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Tipo: {item.itemType}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Descrição do Dano:</h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-description-${index}`}>
                    {item.description}
                  </p>
                </div>
                {item.estimatedImpact && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Impacto Estimado:</h4>
                    <p className="text-sm text-muted-foreground" data-testid={`text-impact-${index}`}>
                      {item.estimatedImpact}
                    </p>
                  </div>
                )}
                
                {(item.priceNew || item.priceUsed || item.repairCost) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">Custos Estimados</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2 pl-6">
                        {item.priceNew && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Preço Novo:</span>
                            <span className="text-sm font-medium" data-testid={`text-price-new-${index}`}>{item.priceNew}</span>
                          </div>
                        )}
                        {item.priceUsed && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Preço Usado:</span>
                            <span className="text-sm font-medium" data-testid={`text-price-used-${index}`}>{item.priceUsed}</span>
                          </div>
                        )}
                        {item.repairCost && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Custo de Reparo:</span>
                            <span className="text-sm font-medium text-primary" data-testid={`text-repair-cost-${index}`}>{item.repairCost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {damageItems.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum dano identificado
          </CardContent>
        </Card>
      )}
    </div>
  );
}
