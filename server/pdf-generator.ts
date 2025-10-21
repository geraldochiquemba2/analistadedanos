import PDFDocument from 'pdfkit';
import type { Analysis } from '@shared/schema';

export function generatePDF(analysis: Analysis): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
  });

  const primaryColor = '#2563eb';
  const textColor = '#1f2937';
  const lightGray = '#f3f4f6';
  const borderColor = '#e5e7eb';

  doc.fillColor(primaryColor);
  doc.fontSize(24);
  doc.font('Helvetica-Bold');
  doc.text('RELATÓRIO DE ANÁLISE DE DANOS', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fillColor('#6b7280');
  doc.fontSize(10);
  doc.font('Helvetica');
  doc.text(
    `Gerado em: ${new Date(analysis.timestamp).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    { align: 'center' }
  );
  doc.text(`ID: ${analysis.id}`, { align: 'center' });

  doc.moveDown(2);
  doc.strokeColor(primaryColor);
  doc.lineWidth(2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

  doc.moveDown(1.5);
  doc.fillColor(textColor);
  doc.fontSize(14);
  doc.font('Helvetica-Bold');
  doc.text('RESUMO EXECUTIVO');
  
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.font('Helvetica');
  doc.fillColor('#374151');
  doc.text(analysis.summary, { align: 'justify', lineGap: 3 });

  if (analysis.description) {
    doc.moveDown(0.5);
    doc.fillColor('#6b7280');
    doc.fontSize(9);
    doc.text(`Descrição adicional: ${analysis.description}`, { align: 'justify' });
  }

  doc.moveDown(1.5);
  doc.fillColor(textColor);
  doc.fontSize(14);
  doc.font('Helvetica-Bold');
  doc.text('ESTATÍSTICAS');

  doc.moveDown(0.5);

  const statsY = doc.y;
  const boxWidth = 120;
  const boxHeight = 70;
  const gap = 15;

  const stats = [
    { label: 'Total de Danos', value: analysis.totalItems.toString(), color: primaryColor },
    { label: 'Alta Severidade', value: analysis.severityCounts.high.toString(), color: '#dc2626' },
    { label: 'Média Severidade', value: analysis.severityCounts.moderate.toString(), color: '#f59e0b' },
    { label: 'Baixa Severidade', value: analysis.severityCounts.low.toString(), color: '#10b981' },
  ];

  let xPos = 50;
  stats.forEach((stat, index) => {
    doc.rect(xPos, statsY, boxWidth, boxHeight).fillAndStroke(lightGray, borderColor);
    
    doc.fillColor(stat.color);
    doc.fontSize(24);
    doc.font('Helvetica-Bold');
    doc.text(stat.value, xPos, statsY + 15, { width: boxWidth, align: 'center' });
    
    doc.fillColor('#6b7280');
    doc.fontSize(9);
    doc.font('Helvetica');
    doc.text(stat.label, xPos, statsY + 45, { width: boxWidth, align: 'center' });
    
    xPos += boxWidth + gap;
  });

  doc.moveDown(6);

  doc.fillColor(textColor);
  doc.fontSize(14);
  doc.font('Helvetica-Bold');
  doc.text('DANOS IDENTIFICADOS');
  doc.moveDown(0.5);

  analysis.damageItems.forEach((item, index) => {
    if (doc.y > 700) {
      doc.addPage();
    }

    const severityColors: Record<string, string> = {
      low: '#10b981',
      moderate: '#f59e0b',
      high: '#dc2626',
    };

    const severityLabels: Record<string, string> = {
      low: 'BAIXA',
      moderate: 'MÉDIA',
      high: 'ALTA',
    };

    const itemStartY = doc.y;
    
    doc.rect(50, itemStartY, 495, 8).fill(lightGray);
    doc.fillColor(textColor);
    doc.fontSize(11);
    doc.font('Helvetica-Bold');
    doc.text(`${index + 1}. ${item.itemName}`, 55, itemStartY + 1);

    doc.moveDown(0.8);

    if (item.itemType) {
      doc.fillColor('#6b7280');
      doc.fontSize(8);
      doc.font('Helvetica');
      doc.text(`Categoria: ${item.itemType}`);
      doc.moveDown(0.3);
    }

    doc.fillColor(severityColors[item.severity]);
    doc.fontSize(8);
    doc.font('Helvetica-Bold');
    doc.text(`Severidade: ${severityLabels[item.severity]}`);
    doc.moveDown(0.5);

    doc.fillColor(textColor);
    doc.fontSize(9);
    doc.font('Helvetica-Bold');
    doc.text('Descrição do Dano:');
    doc.moveDown(0.2);
    doc.font('Helvetica');
    doc.fontSize(9);
    doc.fillColor('#374151');
    doc.text(item.description, { align: 'justify', lineGap: 2 });
    doc.moveDown(0.5);

    if (item.estimatedImpact) {
      doc.fillColor(textColor);
      doc.fontSize(9);
      doc.font('Helvetica-Bold');
      doc.text('Impacto Estimado:');
      doc.moveDown(0.2);
      doc.font('Helvetica');
      doc.fillColor('#374151');
      doc.text(item.estimatedImpact, { align: 'justify', lineGap: 2 });
      doc.moveDown(0.5);
    }

    doc.fillColor(textColor);
    doc.fontSize(9);
    doc.font('Helvetica-Bold');
    doc.text('Estimativa de Custos:');
    doc.moveDown(0.3);

    const priceTableY = doc.y;
    const colWidth = 165;

    doc.rect(50, priceTableY, colWidth, 20).fillAndStroke('#eff6ff', borderColor);
    doc.rect(50 + colWidth, priceTableY, colWidth, 20).fillAndStroke('#eff6ff', borderColor);
    doc.rect(50 + colWidth * 2, priceTableY, colWidth, 20).fillAndStroke('#eff6ff', borderColor);

    doc.fillColor(textColor);
    doc.fontSize(8);
    doc.font('Helvetica-Bold');
    doc.text('Peça Nova', 55, priceTableY + 7, { width: colWidth - 10, align: 'center' });
    doc.text('Peça Usada', 55 + colWidth, priceTableY + 7, { width: colWidth - 10, align: 'center' });
    doc.text('Custo de Reparo', 55 + colWidth * 2, priceTableY + 7, { width: colWidth - 10, align: 'center' });

    const valueY = priceTableY + 20;
    doc.rect(50, valueY, colWidth, 25).fillAndStroke('#ffffff', borderColor);
    doc.rect(50 + colWidth, valueY, colWidth, 25).fillAndStroke('#ffffff', borderColor);
    doc.rect(50 + colWidth * 2, valueY, colWidth, 25).fillAndStroke('#ffffff', borderColor);

    doc.fillColor(primaryColor);
    doc.fontSize(10);
    doc.font('Helvetica-Bold');
    doc.text(item.priceNew || 'N/D', 55, valueY + 8, { width: colWidth - 10, align: 'center' });
    doc.text(item.priceUsed || 'N/D', 55 + colWidth, valueY + 8, { width: colWidth - 10, align: 'center' });
    doc.text(item.repairCost || 'N/D', 55 + colWidth * 2, valueY + 8, { width: colWidth - 10, align: 'center' });

    doc.y = valueY + 25;
    doc.moveDown(1.2);

    doc.strokeColor(borderColor);
    doc.lineWidth(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);
  });

  if (doc.y > 650) {
    doc.addPage();
  }

  doc.moveDown(1);
  doc.fillColor(textColor);
  doc.fontSize(14);
  doc.font('Helvetica-Bold');
  doc.text('RESUMO FINANCEIRO');
  doc.moveDown(0.5);

  const parsePrice = (priceStr: string | undefined): number => {
    if (!priceStr) return 0;
    
    const rangeMatch = priceStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1].replace(/\./g, ''));
      const max = parseFloat(rangeMatch[2].replace(/\./g, ''));
      return (min + max) / 2;
    }
    
    const singleMatch = priceStr.match(/[\d.]+/);
    if (singleMatch) {
      return parseFloat(singleMatch[0].replace(/\./g, ''));
    }
    
    return 0;
  };

  const totalNew = analysis.damageItems.reduce((sum, item) => sum + parsePrice(item.priceNew), 0);
  const totalUsed = analysis.damageItems.reduce((sum, item) => sum + parsePrice(item.priceUsed), 0);
  const totalRepair = analysis.damageItems.reduce((sum, item) => sum + parsePrice(item.repairCost), 0);

  const formatKwanza = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' KZ';
  };

  doc.fillColor('#374151');
  doc.fontSize(10);
  doc.font('Helvetica');
  doc.text(`• Custo total (peças novas): ${formatKwanza(totalNew)}`);
  doc.moveDown(0.3);
  doc.text(`• Custo total (peças usadas): ${formatKwanza(totalUsed)}`);
  doc.moveDown(0.3);
  doc.text(`• Custo total de reparos: ${formatKwanza(totalRepair)}`);

  doc.moveDown(2);
  doc.strokeColor(primaryColor);
  doc.lineWidth(2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

  doc.moveDown(1);
  doc.fillColor('#6b7280');
  doc.fontSize(8);
  doc.font('Helvetica');
  doc.text(
    'Este relatório foi gerado automaticamente por sistema de análise de danos baseado em IA.',
    { align: 'center' }
  );
  doc.text(
    'Os valores apresentados são estimativas e podem variar conforme o mercado e fornecedores.',
    { align: 'center' }
  );

  return doc;
}
