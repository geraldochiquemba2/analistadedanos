import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Trash2 } from "lucide-react";
import type { AnalysisResultData } from "./AnalysisResult";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryPanelProps {
  history: AnalysisResultData[];
  onSelectAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
  selectedId?: string;
}

export function HistoryPanel({
  history,
  onSelectAnalysis,
  onDeleteAnalysis,
  selectedId,
}: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma análise realizada ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          {history.map((analysis) => (
            <Card
              key={analysis.id}
              className={`cursor-pointer transition-all hover-elevate ${
                selectedId === analysis.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSelectAnalysis(analysis.id)}
              data-testid={`history-item-${analysis.id}`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {analysis.timestamp.toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-2">
                      {analysis.totalItems} {analysis.totalItems === 1 ? "item" : "itens"} danificado
                      {analysis.totalItems !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAnalysis(analysis.id);
                    }}
                    data-testid={`button-delete-${analysis.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {analysis.severityCounts.low > 0 && (
                    <Badge variant="default" className="text-xs">
                      {analysis.severityCounts.low} leve{analysis.severityCounts.low > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {analysis.severityCounts.moderate > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {analysis.severityCounts.moderate} moderado{analysis.severityCounts.moderate > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {analysis.severityCounts.high > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {analysis.severityCounts.high} grave{analysis.severityCounts.high > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
