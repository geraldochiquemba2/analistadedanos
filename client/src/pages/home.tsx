import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisResult, type AnalysisResultData } from "@/components/AnalysisResult";
import { HistoryPanel } from "@/components/HistoryPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScanSearch, History, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

//todo: remove mock functionality
const mockAnalyzeImages = async (
  files: File[],
  description: string
): Promise<AnalysisResultData> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    id: `analysis-${Date.now()}`,
    timestamp: new Date(),
    summary:
      "Análise completa realizada com sucesso. Identificados diversos danos em diferentes níveis de severidade. Recomenda-se avaliação profissional para orçamento detalhado de reparos.",
    totalItems: 6,
    severityCounts: {
      low: 2,
      moderate: 2,
      high: 2,
    },
    overallSeverity: "moderate",
    damageItems: [
      {
        itemName: "Componente Principal",
        itemType: "Estrutura",
        severity: "high",
        description:
          "Dano severo identificado com rachadura profunda e deformação estrutural. Comprometimento da integridade detectado.",
        estimatedImpact: "Substituição ou reparo estrutural necessário.",
      },
      {
        itemName: "Acabamento Superficial",
        itemType: "Acabamento",
        severity: "moderate",
        description:
          "Arranhões profundos e descascamento de pintura em área visível.",
        estimatedImpact: "Reparo estético recomendado.",
      },
      {
        itemName: "Sistema de Fixação",
        itemType: "Componente Mecânico",
        severity: "high",
        description:
          "Componente de fixação danificado com perda de funcionalidade.",
        estimatedImpact: "Substituição imediata necessária para segurança.",
      },
      {
        itemName: "Revestimento Protetor",
        itemType: "Proteção",
        severity: "moderate",
        description: "Desgaste acentuado com exposição do material base.",
        estimatedImpact: "Reparo preventivo recomendado.",
      },
      {
        itemName: "Elemento Decorativo",
        itemType: "Estético",
        severity: "low",
        description: "Pequenos riscos superficiais sem comprometimento funcional.",
        estimatedImpact: "Reparo opcional, apenas estético.",
      },
      {
        itemName: "Superfície de Contato",
        itemType: "Interface",
        severity: "low",
        description: "Marcas de uso normal e desgaste superficial.",
        estimatedImpact: "Manutenção preventiva sugerida.",
      },
    ],
  };
};

export default function HomePage() {
  const [view, setView] = useState<"upload" | "result" | "history">("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResultData | null>(null);
  const [history, setHistory] = useState<AnalysisResultData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleAnalyze = async (files: File[], description: string) => {
    setIsAnalyzing(true);
    try {
      //todo: remove mock functionality - replace with actual API call
      const result = await mockAnalyzeImages(files, description);
      setCurrentResult(result);
      setHistory((prev) => [result, ...prev]);
      setView("result");
    } catch (error) {
      console.error("Erro na análise:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectAnalysis = (id: string) => {
    const analysis = history.find((a) => a.id === id);
    if (analysis) {
      setCurrentResult(analysis);
      setView("result");
      setShowHistory(false);
    }
  };

  const handleDeleteAnalysis = (id: string) => {
    setHistory((prev) => prev.filter((a) => a.id !== id));
    if (currentResult?.id === id) {
      setCurrentResult(null);
      setView("upload");
    }
  };

  const handleNewAnalysis = () => {
    setView("upload");
    setCurrentResult(null);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <ScanSearch className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Análise de Danos IA</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Powered by Groq
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                data-testid="button-toggle-history"
                className="hidden sm:flex"
              >
                <History className="h-4 w-4 mr-2" />
                Histórico
                <Badge variant="secondary" className="ml-2">
                  {history.length}
                </Badge>
              </Button>
            )}
            {view === "result" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleNewAnalysis}
                data-testid="button-new-analysis"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Análise
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex">
          <div className={`flex-1 overflow-y-auto ${showHistory ? "hidden lg:block" : ""}`}>
            <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
              {view === "upload" && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-2">
                      Análise Inteligente de Danos
                    </h2>
                    <p className="text-muted-foreground">
                      Faça upload de imagens e receba um relatório detalhado sobre todos os
                      danos identificados
                    </p>
                  </div>
                  <UploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                </div>
              )}

              {view === "result" && currentResult && (
                <AnalysisResult result={currentResult} />
              )}
            </div>
          </div>

          {showHistory && (
            <div className="w-full lg:w-80 xl:w-96 border-l overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Histórico de Análises</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(false)}
                      className="lg:hidden"
                    >
                      Fechar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {history.length} {history.length === 1 ? "análise" : "análises"}{" "}
                    realizada{history.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <HistoryPanel
                    history={history}
                    onSelectAnalysis={handleSelectAnalysis}
                    onDeleteAnalysis={handleDeleteAnalysis}
                    selectedId={currentResult?.id}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {history.length > 0 && (
        <div className="sm:hidden border-t p-2 bg-background">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full"
            data-testid="button-toggle-history-mobile"
          >
            <History className="h-4 w-4 mr-2" />
            {showHistory ? "Ocultar" : "Ver"} Histórico ({history.length})
          </Button>
        </div>
      )}
    </div>
  );
}
