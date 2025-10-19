import { Card, CardContent } from "@/components/ui/card";
import { Eye, Brain, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  stage: "vision" | "reasoning" | "complete";
}

export function AnalysisProgress({ stage }: AnalysisProgressProps) {
  const progress = stage === "vision" ? 25 : stage === "reasoning" ? 75 : 100;

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="analysis-progress">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Processando análise</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              stage === "vision" || stage === "reasoning" || stage === "complete"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {stage === "vision" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-medium mb-1">Etapa 1: Análise Visual</h3>
              <p className="text-sm text-muted-foreground">
                {stage === "vision" 
                  ? "Llama Vision está identificando componentes e danos nas imagens..."
                  : "Componentes e danos identificados com sucesso"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              stage === "reasoning" 
                ? "bg-primary text-primary-foreground"
                : stage === "complete"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {stage === "reasoning" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : stage === "complete" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Brain className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-medium mb-1">Etapa 2: Raciocínio Profundo</h3>
              <p className="text-sm text-muted-foreground">
                {stage === "reasoning"
                  ? "DeepSeek R1 está fazendo análise sistemática e mapeamento completo..."
                  : stage === "complete"
                  ? "Análise sistemática completa com todos os danos identificados"
                  : "Aguardando conclusão da análise visual"}
              </p>
            </div>
          </div>
        </div>

        {stage !== "complete" && (
          <div className="text-center text-sm text-muted-foreground">
            Por favor aguarde... Este processo pode levar alguns momentos
          </div>
        )}
      </CardContent>
    </Card>
  );
}
