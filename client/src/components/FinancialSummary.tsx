import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, Package, Wrench, AlertTriangle } from "lucide-react";
import type { DamageItem } from "./AnalysisResult";

interface FinancialSummaryProps {
  damageItems: DamageItem[];
  assetType?: string;
}

interface PriceRange {
  min: number;
  max: number;
}

function parsePrice(priceStr?: string): PriceRange | null {
  if (!priceStr) return null;
  
  const cleaned = priceStr.replace(/\s/g, '').replace(/KZ/gi, '');
  
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    const min = parseFloat(parts[0].replace(/\./g, '').replace(',', '.'));
    const max = parseFloat(parts[1].replace(/\./g, '').replace(',', '.'));
    return { min, max };
  }
  
  const value = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  return { min: value, max: value };
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + ' KZ';
}

function calculateTotals(items: DamageItem[]) {
  let totalRepairMin = 0;
  let totalRepairMax = 0;
  let totalNewMin = 0;
  let totalNewMax = 0;
  let totalUsedMin = 0;
  let totalUsedMax = 0;
  
  let repairCount = 0;
  let newCount = 0;
  let usedCount = 0;

  items.forEach(item => {
    const repair = parsePrice(item.repairCost);
    const newPrice = parsePrice(item.priceNew);
    const usedPrice = parsePrice(item.priceUsed);
    
    if (repair) {
      totalRepairMin += repair.min;
      totalRepairMax += repair.max;
      repairCount++;
    }
    
    if (newPrice) {
      totalNewMin += newPrice.min;
      totalNewMax += newPrice.max;
      newCount++;
    }
    
    if (usedPrice) {
      totalUsedMin += usedPrice.min;
      totalUsedMax += usedPrice.max;
      usedCount++;
    }
  });

  return {
    repair: { min: totalRepairMin, max: totalRepairMax, count: repairCount },
    new: { min: totalNewMin, max: totalNewMax, count: newCount },
    used: { min: totalUsedMin, max: totalUsedMax, count: usedCount },
  };
}

function calculateSeverityBreakdown(items: DamageItem[]) {
  const breakdown = {
    high: { count: 0, repairMin: 0, repairMax: 0 },
    moderate: { count: 0, repairMin: 0, repairMax: 0 },
    low: { count: 0, repairMin: 0, repairMax: 0 },
  };

  items.forEach(item => {
    const repair = parsePrice(item.repairCost);
    if (repair) {
      breakdown[item.severity].count++;
      breakdown[item.severity].repairMin += repair.min;
      breakdown[item.severity].repairMax += repair.max;
    }
  });

  return breakdown;
}

export function FinancialSummary({ damageItems, assetType = "Bem" }: FinancialSummaryProps) {
  const totals = calculateTotals(damageItems);
  const severityBreakdown = calculateSeverityBreakdown(damageItems);
  
  const hasRepairCosts = totals.repair.count > 0;
  const hasNewPrices = totals.new.count > 0;
  const hasUsedPrices = totals.used.count > 0;

  if (!hasRepairCosts && !hasNewPrices && !hasUsedPrices) {
    return null;
  }

  const savingsMin = totals.new.min > 0 && totals.repair.min > 0 
    ? ((1 - totals.repair.min / totals.new.min) * 100)
    : 0;
  const savingsMax = totals.new.max > 0 && totals.repair.max > 0 
    ? ((1 - totals.repair.max / totals.new.max) * 100)
    : 0;

  return (
    <div className="space-y-4" data-testid="financial-summary">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Resumo Financeiro
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {damageItems.length} {damageItems.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {hasRepairCosts && (
              <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Custo Total de Reparo</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary" data-testid="text-total-repair">
                    {formatCurrency(totals.repair.min)}
                  </p>
                  {totals.repair.max > totals.repair.min && (
                    <p className="text-sm text-muted-foreground">
                      até {formatCurrency(totals.repair.max)}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Baseado em {totals.repair.count} {totals.repair.count === 1 ? 'componente' : 'componentes'}
                </p>
              </div>
            )}

            {hasNewPrices && (
              <div className="space-y-2 p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Substituição (Novo)</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold" data-testid="text-total-new">
                    {formatCurrency(totals.new.min)}
                  </p>
                  {totals.new.max > totals.new.min && (
                    <p className="text-sm text-muted-foreground">
                      até {formatCurrency(totals.new.max)}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Componentes novos
                </p>
              </div>
            )}

            {hasUsedPrices && (
              <div className="space-y-2 p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Substituição (Usado)</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold" data-testid="text-total-used">
                    {formatCurrency(totals.used.min)}
                  </p>
                  {totals.used.max > totals.used.min && (
                    <p className="text-sm text-muted-foreground">
                      até {formatCurrency(totals.used.max)}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Componentes usados
                </p>
              </div>
            )}
          </div>

          {hasRepairCosts && hasNewPrices && savingsMin > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-3 rounded-lg bg-chart-3/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-chart-3" />
                  <span className="text-sm font-medium">Economia com Reparo vs. Substituição</span>
                </div>
                <Badge variant="default" className="bg-chart-3">
                  {savingsMin.toFixed(0)}-{savingsMax.toFixed(0)}% economia
                </Badge>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Breakdown por Gravidade
            </h3>
            <div className="grid gap-3">
              {severityBreakdown.high.count > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">Grave</Badge>
                      <span className="text-sm text-muted-foreground">
                        {severityBreakdown.high.count} {severityBreakdown.high.count === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">
                      {formatCurrency(severityBreakdown.high.repairMin)}
                    </p>
                    {severityBreakdown.high.repairMax > severityBreakdown.high.repairMin && (
                      <p className="text-xs text-muted-foreground">
                        até {formatCurrency(severityBreakdown.high.repairMax)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {severityBreakdown.moderate.count > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-4/5 border border-chart-4/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Moderado</Badge>
                      <span className="text-sm text-muted-foreground">
                        {severityBreakdown.moderate.count} {severityBreakdown.moderate.count === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-chart-4">
                      {formatCurrency(severityBreakdown.moderate.repairMin)}
                    </p>
                    {severityBreakdown.moderate.repairMax > severityBreakdown.moderate.repairMin && (
                      <p className="text-xs text-muted-foreground">
                        até {formatCurrency(severityBreakdown.moderate.repairMax)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {severityBreakdown.low.count > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-3/5 border border-chart-3/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">Leve</Badge>
                      <span className="text-sm text-muted-foreground">
                        {severityBreakdown.low.count} {severityBreakdown.low.count === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-chart-3">
                      {formatCurrency(severityBreakdown.low.repairMin)}
                    </p>
                    {severityBreakdown.low.repairMax > severityBreakdown.low.repairMin && (
                      <p className="text-xs text-muted-foreground">
                        até {formatCurrency(severityBreakdown.low.repairMax)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Nota:</strong> Os valores são estimativas baseadas no mercado angolano e podem variar conforme o modelo específico do bem, disponibilidade de peças e mão de obra.</p>
            <p>📊 Os intervalos de preços refletem variações de qualidade, marca e condição dos componentes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
