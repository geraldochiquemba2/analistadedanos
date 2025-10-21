import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DamageItemCard, type DamageSeverity } from "./DamageItemCard";
import { FileText, Calendar, LayoutGrid, List, Filter, ArrowUpDown, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DamageList } from "./DamageList";
import { ExportButton } from "./ExportButton";
import { FinancialSummary } from "./FinancialSummary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export interface DamageItem {
  itemName: string;
  itemType?: string;
  severity: DamageSeverity;
  description: string;
  estimatedImpact?: string;
  priceNew?: string;
  priceUsed?: string;
  repairCost?: string;
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

const seguradoras = [
  "ENSA - Empresa Nacional de Seguros de Angola",
  "AAA Seguros",
  "Global Alliance",
  "Nossa Seguros",
  "Angola Seguros",
  "Universal Seguros",
  "Garantia Seguros",
  "Previdente Seguros",
  "Constância Seguros",
  "Fidelidade Angola",
];

export function AnalysisResult({ result }: AnalysisResultProps) {
  const [severityFilter, setSeverityFilter] = useState<DamageSeverity | "all">("all");
  const [sortBy, setSortBy] = useState<"severity" | "name">("severity");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSeguradora, setSelectedSeguradora] = useState("");
  const [telefone, setTelefone] = useState("");
  const [apolice, setApolice] = useState("");
  const { toast } = useToast();
  
  const severityLabel = {
    low: "Danos Leves",
    moderate: "Danos Moderados",
    high: "Danos Graves",
  };

  const handleEnviar = () => {
    if (!selectedSeguradora || !telefone || !apolice) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
      });
      return;
    }

    toast({
      title: "Relatório enviado!",
      description: `Relatório enviado para ${selectedSeguradora} com sucesso.`,
    });

    setDialogOpen(false);
    setSelectedSeguradora("");
    setTelefone("");
    setApolice("");
  };

  const severityOrder: Record<DamageSeverity, number> = {
    high: 3,
    moderate: 2,
    low: 1,
  };

  const filteredItems = result.damageItems.filter(
    (item) => severityFilter === "all" || item.severity === severityFilter
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "severity") {
      return severityOrder[b.severity] - severityOrder[a.severity];
    } else {
      return a.itemName.localeCompare(b.itemName);
    }
  });

  return (
    <div className="space-y-6" data-testid="analysis-result">
      <FinancialSummary damageItems={result.damageItems} />
      
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
            <div className="flex items-center gap-2 flex-wrap">
              <ExportButton result={result} />
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" data-testid="button-send-insurance">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar para Seguradora
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enviar Relatório para Seguradora</DialogTitle>
                    <DialogDescription>
                      Selecione a seguradora e preencha seus dados para enviar o relatório.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="seguradora">Seguradora *</Label>
                      <Select value={selectedSeguradora} onValueChange={setSelectedSeguradora}>
                        <SelectTrigger id="seguradora" data-testid="select-insurance">
                          <SelectValue placeholder="Selecione a seguradora" />
                        </SelectTrigger>
                        <SelectContent>
                          {seguradoras.map((seg) => (
                            <SelectItem key={seg} value={seg}>
                              {seg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedSeguradora && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="telefone">Número de Telemóvel *</Label>
                          <Input
                            id="telefone"
                            placeholder="+244 900 000 000"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            data-testid="input-phone"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apolice">Número da Apólice *</Label>
                          <Input
                            id="apolice"
                            placeholder="Ex: APL123456"
                            value={apolice}
                            onChange={(e) => setApolice(e.target.value)}
                            data-testid="input-policy"
                          />
                        </div>

                        <Button
                          onClick={handleEnviar}
                          className="w-full"
                          data-testid="button-submit-insurance"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Relatório
                        </Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
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

      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as DamageSeverity | "all")}>
            <SelectTrigger className="w-40" data-testid="select-severity-filter">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Danos</SelectItem>
              <SelectItem value="high">Graves</SelectItem>
              <SelectItem value="moderate">Moderados</SelectItem>
              <SelectItem value="low">Leves</SelectItem>
            </SelectContent>
          </Select>

          <ArrowUpDown className="h-4 w-4 text-muted-foreground ml-2" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "severity" | "name")}>
            <SelectTrigger className="w-40" data-testid="select-sort">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="severity">Por Severidade</SelectItem>
              <SelectItem value="name">Por Nome</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Badge variant="outline" className="text-sm">
          {filteredItems.length} de {result.totalItems} itens
        </Badge>
      </div>

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
            <div className="grid gap-4 md:grid-cols-2">
              {sortedItems.map((item, index) => (
                <DamageItemCard key={index} {...item} />
              ))}
            </div>
            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum dano encontrado com os filtros selecionados
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6 w-full">
          <DamageList damageItems={sortedItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
