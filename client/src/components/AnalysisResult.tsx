import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DamageItemCard, type DamageSeverity } from "./DamageItemCard";
import { FileText, Calendar, LayoutGrid, List } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DamageList } from "./DamageList";

export interface DamageItem {
  itemName: string;
  itemType?: string;
  severity: DamageSeverity;
  description: string;
  estimatedImpact?: string;
}

export interface AnalysisResultData {
  id: string;
  timestamp: Date;
  summary: string;
  totalItems: number;
  severityCounts: {
    low: number;
    moderate: number;
    high: number;
  };
  damageItems: DamageItem[];
  overallSeverity: DamageSeverity;
}

interface AnalysisResultProps {
  result: AnalysisResultData;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const severityLabel = {
    low: "Danos Leves",
    moderate: "Danos Moderados",
    high: "Danos Graves",
  };

  return (
    <div className="space-y-6" data-testid="analysis-result">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl mb-2">Relatório de Análise</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{result.timestamp.toLocaleString("pt-BR")}</span>
              </div>
            </div>
            <Badge
              variant={
                result.overallSeverity === "high"
                  ? "destructive"
                  : result.overallSeverity === "moderate"
                  ? "secondary"
                  : "default"
              }
              className="text-sm px-3 py-1"
            >
              {severityLabel[result.overallSeverity]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Resumo Geral:</h3>
            <p className="text-muted-foreground">{result.summary}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total de Itens</p>
              <p className="text-2xl font-semibold" data-testid="text-total-items">
                {result.totalItems}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Danos Leves</p>
              <p className="text-2xl font-semibold text-chart-3">
                {result.severityCounts.low}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Danos Moderados</p>
              <p className="text-2xl font-semibold text-chart-4">
                {result.severityCounts.moderate}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Danos Graves</p>
              <p className="text-2xl font-semibold text-destructive">
                {result.severityCounts.high}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2" data-testid="tabs-view-selector">
          <TabsTrigger value="grid" data-testid="tab-grid-view">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Visualização em Grade
          </TabsTrigger>
          <TabsTrigger value="list" data-testid="tab-list-view">
            <List className="h-4 w-4 mr-2" />
            Lista de Danos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">
                Itens Danificados ({result.damageItems.length})
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {result.damageItems.map((item, index) => (
                <DamageItemCard key={index} {...item} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6 w-full">
          <DamageList damageItems={result.damageItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
