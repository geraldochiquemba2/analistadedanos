import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UploadZone, type AssetInfo } from "@/components/UploadZone";
import { AnalysisResult, type AnalysisResultData } from "@/components/AnalysisResult";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { HistoryPanel } from "@/components/HistoryPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScanSearch, History, Plus, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function HomePage() {
  const [view, setView] = useState<"upload" | "result" | "history">("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<"vision" | "reasoning" | "complete">("vision");
  const [currentResult, setCurrentResult] = useState<AnalysisResultData | null>(null);
  const [history, setHistory] = useState<AnalysisResultData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch("/api/analyses");
      if (!response.ok) throw new Error("Falha ao carregar histórico");
      const data = await response.json();
      const analyses = data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
      setHistory(analyses);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const handleAnalyze = async (files: File[], description: string, assetInfo: AssetInfo) => {
    setIsAnalyzing(true);
    setAnalysisStage("vision");
    
    let stageTimer: NodeJS.Timeout | null = null;
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("description", description);
      formData.append("assetInfo", JSON.stringify(assetInfo));

      // Transição para etapa de raciocínio após 3 segundos
      stageTimer = setTimeout(() => {
        setAnalysisStage("reasoning");
      }, 3000);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Erro na análise");
      }

      const result = await response.json();
      const analysis: AnalysisResultData = {
        ...result,
        timestamp: new Date(result.timestamp),
      };

      setAnalysisStage("complete");
      setCurrentResult(analysis);
      setHistory((prev) => [analysis, ...prev]);
      
      setTimeout(() => {
        setView("result");
      }, 1000);

      toast({
        title: "Análise concluída com sucesso! 🎉",
        description: `${analysis.totalItems} ${analysis.totalItems === 1 ? "item danificado foi identificado" : "itens danificados foram identificados"} pelos dois modelos de IA.`,
      });
    } catch (error) {
      console.error("Erro na análise:", error);
      toast({
        variant: "destructive",
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível completar a análise. Tente novamente.",
      });
    } finally {
      if (stageTimer) {
        clearTimeout(stageTimer);
      }
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

  const handleDeleteAnalysis = async (id: string) => {
    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Falha ao deletar análise");

      setHistory((prev) => prev.filter((a) => a.id !== id));
      if (currentResult?.id === id) {
        setCurrentResult(null);
        setView("upload");
      }

      toast({
        title: "Análise removida",
        description: "A análise foi removida do histórico.",
      });
    } catch (error) {
      console.error("Erro ao deletar análise:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Não foi possível remover a análise. Tente novamente.",
      });
    }
  };

  const handleNewAnalysis = () => {
    setView("upload");
    setCurrentResult(null);
    setShowHistory(false);
  };

  return (
    <div 
      className="flex flex-col h-screen relative"
      style={{
        backgroundImage: 'url(https://www.diarioeconomico.co.mz/wp-content/uploads/2022/02/Seguro-Automovel.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95 dark:from-background/98 dark:via-background/95 dark:to-background/98" />
      
      <header className="sticky top-0 z-50 border-b bg-background/80 dark:bg-background/90 backdrop-blur relative">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              data-testid="button-home"
            >
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Início</span>
            </Button>
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

      <main className="flex-1 overflow-hidden relative z-10">
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
                      Análise em duas etapas: Visão (Llama 3.2 90B) + Raciocínio (DeepSeek R1)
                    </p>
                  </div>
                  {isAnalyzing ? (
                    <AnalysisProgress stage={analysisStage} />
                  ) : (
                    <UploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                  )}
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
        <div className="sm:hidden border-t p-2 bg-background/80 backdrop-blur relative z-10">
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
