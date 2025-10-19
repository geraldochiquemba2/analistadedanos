import { AnalysisResult } from "../AnalysisResult";

export default function AnalysisResultExample() {
  const mockResult = {
    id: "analysis-1",
    timestamp: new Date(),
    summary:
      "Análise completa de veículo após colisão frontal. Identificados danos estruturais e estéticos em múltiplos componentes da parte dianteira e lateral direita do veículo.",
    totalItems: 5,
    severityCounts: {
      low: 1,
      moderate: 2,
      high: 2,
    },
    overallSeverity: "high" as const,
    damageItems: [
      {
        itemName: "Para-choque Dianteiro",
        itemType: "Componente Externo",
        severity: "high" as const,
        description:
          "Rachadura profunda de 15cm na lateral direita com exposição de material interno e descascamento da pintura.",
        estimatedImpact: "Substituição necessária.",
      },
      {
        itemName: "Farol Direito",
        itemType: "Sistema de Iluminação",
        severity: "high" as const,
        description:
          "Lente completamente quebrada, componentes internos expostos à umidade.",
        estimatedImpact: "Substituição imediata requerida.",
      },
      {
        itemName: "Para-lama Direito",
        itemType: "Componente de Carroceria",
        severity: "moderate" as const,
        description: "Amassado profundo com deformação de aproximadamente 8cm.",
        estimatedImpact: "Funilaria necessária ou substituição.",
      },
      {
        itemName: "Porta Dianteira Direita",
        itemType: "Estrutura",
        severity: "moderate" as const,
        description: "Arranhões profundos na pintura e leve deformação na borda.",
        estimatedImpact: "Repintura e possível reparo estrutural.",
      },
      {
        itemName: "Retrovisor Direito",
        itemType: "Componente Externo",
        severity: "low" as const,
        description: "Arranhões superficiais no plástico, sem danos ao espelho.",
        estimatedImpact: "Reparo estético opcional.",
      },
    ],
  };

  return (
    <div className="p-6">
      <AnalysisResult result={mockResult} />
    </div>
  );
}
