import { DamageItemCard } from "../DamageItemCard";

export default function DamageItemCardExample() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <DamageItemCard
        itemName="Para-choque Dianteiro"
        itemType="Veículo - Componente Externo"
        severity="high"
        description="Rachadura profunda de aproximadamente 15cm na lateral direita do para-choque. Deformação visível com exposição de material interno. Pintura descascada em área adjacente."
        estimatedImpact="Substituição necessária. Risco de segurança em novas colisões."
      />
      <DamageItemCard
        itemName="Porta de Entrada"
        itemType="Imóvel - Estrutura"
        severity="moderate"
        description="Arranhões superficiais na pintura e pequeno amassado na parte inferior."
        estimatedImpact="Reparo estético recomendado. Funcionalidade preservada."
      />
      <DamageItemCard
        itemName="Tela do Smartphone"
        itemType="Eletrônico"
        severity="low"
        description="Micro arranhões superficiais na região superior da tela, sem comprometimento do touch."
      />
    </div>
  );
}
