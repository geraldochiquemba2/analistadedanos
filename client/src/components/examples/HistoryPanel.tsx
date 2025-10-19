import { HistoryPanel } from "../HistoryPanel";
import { useState } from "react";

export default function HistoryPanelExample() {
  const [selectedId, setSelectedId] = useState<string>();

  const mockHistory = [
    {
      id: "analysis-3",
      timestamp: new Date(Date.now() - 86400000),
      summary: "Análise de danos em smartphone",
      totalItems: 2,
      severityCounts: { low: 2, moderate: 0, high: 0 },
      overallSeverity: "low" as const,
      damageItems: [],
    },
    {
      id: "analysis-2",
      timestamp: new Date(Date.now() - 172800000),
      summary: "Análise de danos em imóvel",
      totalItems: 4,
      severityCounts: { low: 1, moderate: 2, high: 1 },
      overallSeverity: "moderate" as const,
      damageItems: [],
    },
    {
      id: "analysis-1",
      timestamp: new Date(Date.now() - 259200000),
      summary: "Análise de veículo após colisão",
      totalItems: 5,
      severityCounts: { low: 1, moderate: 2, high: 2 },
      overallSeverity: "high" as const,
      damageItems: [],
    },
  ];

  return (
    <div className="p-6 max-w-md mx-auto h-[600px]">
      <HistoryPanel
        history={mockHistory}
        onSelectAnalysis={(id) => {
          console.log("Análise selecionada:", id);
          setSelectedId(id);
        }}
        onDeleteAnalysis={(id) => console.log("Deletar análise:", id)}
        selectedId={selectedId}
      />
    </div>
  );
}
