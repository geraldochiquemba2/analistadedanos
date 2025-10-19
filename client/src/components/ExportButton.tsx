import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AnalysisResultData } from "./AnalysisResult";

interface ExportButtonProps {
  result: AnalysisResultData;
}

export function ExportButton({ result }: ExportButtonProps) {
  const exportAsText = () => {
    let text = `RELATÓRIO DE ANÁLISE DE DANOS\n`;
    text += `${"=".repeat(50)}\n\n`;
    text += `Data: ${result.timestamp.toLocaleString("pt-BR")}\n`;
    text += `Severidade Geral: ${result.overallSeverity.toUpperCase()}\n`;
    text += `Total de Itens Danificados: ${result.totalItems}\n\n`;
    
    text += `RESUMO:\n${result.summary}\n\n`;
    
    text += `ESTATÍSTICAS:\n`;
    text += `- Danos Leves: ${result.severityCounts.low}\n`;
    text += `- Danos Moderados: ${result.severityCounts.moderate}\n`;
    text += `- Danos Graves: ${result.severityCounts.high}\n\n`;
    
    text += `LISTA COMPLETA DE DANOS:\n`;
    text += `${"-".repeat(50)}\n\n`;
    
    result.damageItems.forEach((item, index) => {
      text += `${index + 1}. ${item.itemName.toUpperCase()}\n`;
      text += `   Tipo: ${item.itemType || "N/A"}\n`;
      text += `   Severidade: ${item.severity.toUpperCase()}\n`;
      text += `   Descrição: ${item.description}\n`;
      if (item.estimatedImpact) {
        text += `   Impacto: ${item.estimatedImpact}\n`;
      }
      text += `\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analise-danos-${result.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const jsonData = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analise-danos-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsText} data-testid="export-text">
          <Download className="h-4 w-4 mr-2" />
          Exportar como Texto (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} data-testid="export-json">
          <Download className="h-4 w-4 mr-2" />
          Exportar como JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
