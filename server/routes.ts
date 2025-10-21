import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Groq from "groq-sdk";
import { insertAnalysisSchema } from "@shared/schema";
import multer from "multer";
import { generatePDF } from "./pdf-generator";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 2990000,
    files: 5
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  },
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeImagesWithGroq(
  files: Express.Multer.File[],
  description: string,
  assetInfo: any = {}
): Promise<any> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY não configurada");
  }

  console.log("🔍 ETAPA 1: Análise visual com Llama 4 Scout Vision...");
  
  // ETAPA 1: Llama Vision analisa as imagens
  const visualAnalysis = await analyzeWithVision(files, description);
  
  console.log("🧠 ETAPA 2: Raciocínio profundo com Llama 3.3 70B...");
  
  // ETAPA 2: Llama 3.3 70B faz análise sistemática profunda
  const deepAnalysis = await analyzeWithReasoning(visualAnalysis, description, assetInfo);
  
  return deepAnalysis;
}

async function analyzeWithVision(
  files: Express.Multer.File[],
  description: string
): Promise<string> {
  const content: any[] = [
    {
      type: "text",
      text: `Você é um especialista em identificação visual de componentes e danos. Analise detalhadamente as imagens fornecidas.

${description ? `Contexto adicional fornecido pelo usuário: ${description}` : ""}

Sua tarefa:
1. Identifique o tipo de objeto/bem (veículo, imóvel, equipamento, etc.)
2. Liste TODOS os componentes visíveis na imagem
3. Para cada componente visível, descreva DETALHADAMENTE:
   - O componente em si COM O LADO ESPECIFICADO (ex: "Porta Dianteira Esquerda" e não apenas "Porta")
   - Seu estado (perfeito, danificado, sujo, etc.)
   - Todos os danos visíveis (arranhões, amassados, rachaduras, desgastes, manchas, etc.)
   - Localização MUITO PRECISA de cada dano usando termos direcionais claros
   - Tamanho aproximado dos danos

Exemplo para VEÍCULOS - componentes possíveis COM LADOS:
- Externos: Para-choque Dianteiro, Para-choque Traseiro, Porta Dianteira Esquerda, Porta Dianteira Direita, Porta Traseira Esquerda, Porta Traseira Direita, Capô, Tampa do Porta-malas, Para-lama Dianteiro Esquerdo, Para-lama Dianteiro Direito, Para-lama Traseiro Esquerdo, Para-lama Traseiro Direito, Para-brisa, Vidro Lateral Dianteiro Esquerdo, Vidro Lateral Dianteiro Direito, Retrovisor Externo Esquerdo, Retrovisor Externo Direito, Farol Dianteiro Esquerdo, Farol Dianteiro Direito, Lanterna Traseira Esquerda, Lanterna Traseira Direita, Roda Dianteira Esquerda, Roda Dianteira Direita, Roda Traseira Esquerda, Roda Traseira Direita
- Internos: Banco Dianteiro Esquerdo (motorista), Banco Dianteiro Direito, Banco Traseiro (especificar lado se relevante)

IMPORTANTE - ESPECIFICAÇÃO DE LOCALIZAÇÃO:
- Seja EXTREMAMENTE detalhado
- SEMPRE especifique o LADO: esquerdo, direito, dianteiro, traseiro, central
- Para cada dano, especifique também a POSIÇÃO no componente: superior, inferior, lateral, central
- Use referências claras: "no canto superior esquerdo", "na parte inferior central", "na lateral direita próximo à maçaneta"
- Não omita NENHUM componente visível
- Não omita NENHUM dano, por menor que seja
- Evite ambiguidades - seja específico sobre ONDE exatamente está o dano

Formato de resposta (texto livre, muito detalhado):`,
    },
  ];

  for (const file of files) {
    const base64Image = file.buffer.toString("base64");
    const mimeType = file.mimetype || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    const dataUrlSize = Buffer.byteLength(dataUrl, 'utf8');
    if (dataUrlSize > 4000000) {
      const error: any = new Error("Imagem muito grande após codificação. Cada imagem deve ter menos de 3MB.");
      error.status = 400;
      throw error;
    }
    
    content.push({
      type: "image_url",
      image_url: {
        url: dataUrl,
      },
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const visualDescription = completion.choices[0]?.message?.content || "";
    
    if (!visualDescription) {
      throw new Error("Análise visual não retornou descrição");
    }

    console.log("✅ Análise visual concluída");
    return visualDescription;
  } catch (error) {
    console.error("Erro na análise visual:", error);
    throw error;
  }
}

async function analyzeWithReasoning(
  visualDescription: string,
  userDescription: string,
  assetInfo: any = {}
): Promise<any> {
  const assetContext = [];
  if (assetInfo.assetType) {
    const typeMap: any = {
      vehicle: "Veículo",
      furniture: "Móvel",
      real_estate: "Imóvel",
      other: "Outro"
    };
    assetContext.push(`Tipo: ${typeMap[assetInfo.assetType] || assetInfo.assetType}`);
  }
  if (assetInfo.brand) assetContext.push(`Marca: ${assetInfo.brand}`);
  if (assetInfo.model) assetContext.push(`Modelo: ${assetInfo.model}`);
  if (assetInfo.year) assetContext.push(`Ano: ${assetInfo.year}`);
  if (assetInfo.quality) {
    const qualityMap: any = {
      premium: "Premium/Luxo",
      medium: "Médio",
      economy: "Econômico"
    };
    assetContext.push(`Categoria: ${qualityMap[assetInfo.quality] || assetInfo.quality}`);
  }
  
  const prompt = `Você é um especialista em análise sistemática de danos com raciocínio avançado. 

INFORMAÇÕES DO BEM SEGURADO:
${assetContext.length > 0 ? assetContext.join(" | ") : "Não fornecido"}
⚠️ IMPORTANTE: Use essas informações para ajustar os preços conforme os fatores de ajuste especificados!

CONTEXTO DO USUÁRIO:
${userDescription ? userDescription : "Não fornecido"}

DESCRIÇÃO VISUAL DETALHADA (fornecida por análise de imagem):
${visualDescription}

Sua tarefa é fazer uma análise SISTEMÁTICA E EXAUSTIVA seguindo esta metodologia OBRIGATÓRIA:

ETAPA 1 - IDENTIFICAÇÃO DO OBJETO:
Identifique o tipo de objeto/bem descrito na análise visual.

ETAPA 2 - IDENTIFICAÇÃO DOS COMPONENTES VISÍVEIS:
Liste APENAS os componentes que foram MENCIONADOS e DESCRITOS na análise visual.
NÃO liste componentes que não aparecem ou não foram mencionados na descrição visual.

ETAPA 3 - ANÁLISE SISTEMÁTICA DOS DANOS VISÍVEIS:
Para CADA componente mencionado na descrição visual:
a) Verifique se há algum dano descrito para esse componente
b) Se houver dano, crie uma entrada SEPARADA para cada dano específico
c) Liste APENAS os danos que foram CLARAMENTE IDENTIFICADOS na descrição visual

TABELA DE PREÇOS DE REFERÊNCIA - ANGOLA (Kwanzas - KZ):

VEÍCULOS:
- Para-choque: Novo 150.000-300.000 KZ | Usado 50.000-150.000 KZ | Reparo 30.000-100.000 KZ
- Porta: Novo 400.000-800.000 KZ | Usado 200.000-400.000 KZ | Reparo 50.000-200.000 KZ
- Capô: Novo 300.000-600.000 KZ | Usado 150.000-300.000 KZ | Reparo 80.000-250.000 KZ
- Para-lama: Novo 200.000-400.000 KZ | Usado 100.000-200.000 KZ | Reparo 40.000-150.000 KZ
- Farol: Novo 150.000-400.000 KZ | Usado 80.000-200.000 KZ | Reparo/Troca 50.000-150.000 KZ
- Retrovisor: Novo 80.000-200.000 KZ | Usado 40.000-100.000 KZ | Reparo 20.000-80.000 KZ
- Vidro lateral: Novo 100.000-250.000 KZ | Usado 50.000-150.000 KZ | Troca 60.000-200.000 KZ
- Para-brisa: Novo 150.000-400.000 KZ | Usado 80.000-200.000 KZ | Troca 100.000-300.000 KZ
- Lanterna: Novo 80.000-200.000 KZ | Usado 40.000-100.000 KZ | Troca 50.000-150.000 KZ
- Banco: Novo 200.000-500.000 KZ | Usado 100.000-250.000 KZ | Reparo 30.000-120.000 KZ
- Volante: Novo 100.000-300.000 KZ | Usado 50.000-150.000 KZ | Troca 80.000-200.000 KZ
- Painel: Novo 300.000-800.000 KZ | Usado 150.000-400.000 KZ | Reparo 100.000-300.000 KZ

MÓVEIS:
- Sofá: Novo 250.000-400.000 KZ | Usado 100.000-260.000 KZ
- Cama: Novo 90.000-250.000 KZ | Usado 50.000-150.000 KZ
- Mesa jantar: Novo 95.000-630.000 KZ | Usado 50.000-300.000 KZ
- Cadeira: Novo 80.000-150.000 KZ | Usado 30.000-80.000 KZ
- Guarda-roupa: Novo 520.000-800.000 KZ | Usado 250.000-520.000 KZ
- Estante: Novo 200.000-500.000 KZ | Usado 90.000-300.000 KZ
- Mesa centro: Novo 25.000-95.000 KZ | Usado 15.000-50.000 KZ
- Cômoda: Novo 185.000-400.000 KZ | Usado 80.000-200.000 KZ

FORMATO DE SAÍDA JSON OBRIGATÓRIO (TODOS OS CAMPOS SÃO OBRIGATÓRIOS):

{
  "summary": "Tipo de bem + resumo dos danos identificados visualmente nas imagens analisadas",
  "damageItems": [
    {
      "itemName": "Nome ESPECÍFICO do componente com LADO completo (ex: Para-choque Dianteiro, Porta Traseira Esquerda, Farol Dianteiro Direito, Retrovisor Externo Esquerdo, Para-lama Dianteiro Direito)",
      "itemType": "Categoria (ex: Elemento Externo - Carroceria, Iluminação, Vidros)",
      "severity": "low|moderate|high",
      "description": "Descrição MUITO detalhada do dano VISÍVEL com LOCALIZAÇÃO PRECISA E SEM AMBIGUIDADE: 
      - Tipo de dano (arranhão/amassado/rachadura/etc)
      - Localização EXATA usando termos direcionais (ex: 'no canto superior direito', 'na parte central inferior', 'na lateral esquerda próximo à borda superior')
      - Dimensões aproximadas (ex: '5cm de comprimento', 'área de 10x8cm')
      - Características visuais específicas",
      "estimatedImpact": "Impacto funcional, recomendações de reparo e urgência",
      "priceNew": "OBRIGATÓRIO - Preço do componente NOVO em Kwanzas (ex: '300.000 KZ' ou '200.000-400.000 KZ')",
      "priceUsed": "OBRIGATÓRIO - Preço do componente USADO/Segunda mão em Kwanzas (ex: '150.000 KZ' ou '100.000-200.000 KZ')",
      "repairCost": "OBRIGATÓRIO - Custo estimado de REPARO em Kwanzas (ex: '80.000 KZ' ou '50.000-120.000 KZ')"
    }
  ]
}

EXEMPLO COMPLETO DE UM ITEM:
{
  "itemName": "Para-choque Dianteiro",
  "itemType": "Elemento Externo - Carroceria",
  "severity": "high",
  "description": "Amassado profundo na parte lateral esquerda, com aproximadamente 15 cm de comprimento e 5 cm de profundidade. Pequenos rasgos na parte inferior central, com cerca de 3 cm de comprimento",
  "estimatedImpact": "Impacto estrutural, recomendação de reparo ou substituição, urgência alta",
  "priceNew": "150.000-300.000 KZ",
  "priceUsed": "50.000-150.000 KZ",
  "repairCost": "80.000-100.000 KZ"
}

REGRAS ABSOLUTAS:
- Liste APENAS os danos que foram EXPLICITAMENTE MENCIONADOS na descrição visual
- NÃO invente ou presuma danos que não foram descritos
- NÃO liste componentes sem danos visíveis
- Para CADA dano mencionado na descrição visual, crie uma entrada SEPARADA
- Cada arranhão, rachadura, amassado, desgaste, mancha, quebra MENCIONADO = entrada separada
- Inclua todos os danos descritos, mesmo os pequenos e superficiais
- Severity: "low" (superficial/estético), "moderate" (função parcial), "high" (estrutural/grave)
- Seja EXTREMAMENTE detalhado nas descrições dos danos VISÍVEIS
- Use português brasileiro formal

ESPECIFICAÇÃO DE LOCALIZAÇÃO (OBRIGATÓRIO):
- SEMPRE especifique o LADO completo do componente no itemName (ex: "Porta Dianteira Esquerda", "Para-lama Traseiro Direito", "Farol Dianteiro Esquerdo")
- NUNCA use apenas "Porta" ou "Para-lama" - sempre inclua dianteiro/traseiro E esquerdo/direito
- Na descrição, especifique a posição EXATA do dano usando termos direcionais múltiplos:
  * Exemplos CORRETOS: "na parte superior esquerda", "no canto inferior direito", "na região central inferior", "na lateral direita próximo à parte superior"
  * Exemplos INCORRETOS: "na lateral" (falta especificar qual lateral e onde), "em cima" (vago)
- Use pontos de referência quando possível (ex: "próximo à maçaneta", "abaixo do retrovisor", "ao lado do farol")
- Evite termos vagos ou ambíguos - seja sempre específico e claro

ESTIMATIVA DE PREÇOS (OBRIGATÓRIO):
- Use a TABELA DE PREÇOS DE REFERÊNCIA como BASE, mas AJUSTE os valores conforme as características do bem:
  
  FATORES DE AJUSTE DE PREÇO:
  * Marca/Modelo Premium (Mercedes, BMW, Lexus, Toyota high-end): +30-50% sobre preços base
  * Marca/Modelo Médio (Toyota padrão, Honda, Nissan): usar preços base da tabela
  * Marca/Modelo Econômico (marcas populares): -20-30% sobre preços base
  * Móveis de luxo/designer: +40-60% sobre preços base
  * Móveis de qualidade média: usar preços base da tabela
  * Móveis econômicos: -25-35% sobre preços base
  * Ano do veículo/móvel (novo 0-3 anos): usar limite superior da tabela
  * Ano médio (4-7 anos): usar valores médios da tabela
  * Ano antigo (8+ anos): usar limite inferior da tabela
  * Componentes importados vs. locais: importados +20-40%
  
  CÁLCULO DE CUSTOS:
  - Para priceNew: consulte a tabela e ajuste conforme fatores acima
  - Para priceUsed: 40-60% do priceNew para componentes em boas condições
  - Para repairCost: 
    * Se severity="low": 20-40% do valor de reparo base da tabela
    * Se severity="moderate": 50-80% do valor de reparo base da tabela
    * Se severity="high": 80-100% do valor de reparo base, ou próximo ao valor de substituição usado
  
- Analise o contexto da imagem para determinar: marca, modelo, ano aproximado, categoria de qualidade
- Se não houver informações claras, use valores médios da tabela
- SEMPRE forneça os três campos de preço (priceNew, priceUsed, repairCost) para cada dano
- Use formato claro e específico: "300.000 KZ" ou "200.000-400.000 KZ"
- Seja conservador nas estimativas - é melhor subestimar que superestimar

IMPORTANTE CRÍTICO:
- A lista deve conter APENAS danos que foram VISUALMENTE IDENTIFICADOS nas imagens
- Se a descrição visual menciona "vários arranhões", liste cada um separadamente
- NÃO adicione danos que não foram mencionados na descrição visual
- Seja fiel à descrição visual - liste tudo que foi descrito, mas NADA além disso

Retorne APENAS o objeto JSON válido, sem markdown ou texto adicional.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 8192,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsedResponse = JSON.parse(responseText);

    if (!parsedResponse.damageItems || !Array.isArray(parsedResponse.damageItems)) {
      throw new Error("Resposta do modelo em formato inválido");
    }

    // Debug: verificar se os preços estão sendo retornados
    const firstItem = parsedResponse.damageItems[0];
    if (firstItem) {
      console.log('🔍 DEBUG - Primeiro item:', JSON.stringify(firstItem, null, 2));
    }

    console.log(`✅ Análise profunda concluída: ${parsedResponse.damageItems.length} danos identificados`);
    return parsedResponse;
  } catch (error) {
    console.error("Erro na análise profunda:", error);
    if (error instanceof Error) {
      throw new Error(`Falha na análise profunda: ${error.message}`);
    }
    throw new Error("Falha na análise profunda");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post(
    "/api/analyze",
    (req, res, next) => {
      upload.array("images", 5)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              error: "Arquivo muito grande",
              details: "Cada imagem deve ter no máximo 3MB"
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
              error: "Muitas imagens",
              details: "Envie no máximo 5 imagens por análise"
            });
          }
          return res.status(400).json({ 
            error: "Erro no upload",
            details: err.message
          });
        }
        if (err) {
          return res.status(400).json({ 
            error: "Arquivo inválido",
            details: err.message
          });
        }
        next();
      });
    },
    async (req, res) => {
      try {
        const files = req.files as Express.Multer.File[];
        const { description = "", assetInfo = "{}" } = req.body;
        
        let parsedAssetInfo;
        try {
          parsedAssetInfo = JSON.parse(assetInfo);
        } catch {
          parsedAssetInfo = {};
        }

        if (!files || files.length === 0) {
          return res.status(400).json({ error: "Nenhuma imagem fornecida" });
        }

        if (!process.env.GROQ_API_KEY) {
          return res.status(500).json({ 
            error: "Configuração ausente",
            details: "GROQ_API_KEY não está configurada no servidor"
          });
        }

        const groqResponse = await analyzeImagesWithGroq(files, description, parsedAssetInfo);

        const damageItems = groqResponse.damageItems || [];
        
        if (damageItems.length === 0) {
          return res.status(400).json({
            error: "Nenhum dano identificado",
            details: "A análise não identificou danos nas imagens fornecidas. Tente com imagens mais claras ou forneça mais contexto."
          });
        }

        const severityCounts = {
          low: damageItems.filter((item: any) => item.severity === "low").length,
          moderate: damageItems.filter((item: any) => item.severity === "moderate").length,
          high: damageItems.filter((item: any) => item.severity === "high").length,
        };

        let overallSeverity: "low" | "moderate" | "high" = "low";
        if (severityCounts.high > 0) {
          overallSeverity = "high";
        } else if (severityCounts.moderate > 0) {
          overallSeverity = "moderate";
        }

        const analysisData = {
          summary: groqResponse.summary || "Análise concluída com sucesso",
          totalItems: damageItems.length,
          severityCounts,
          damageItems,
          overallSeverity,
          description,
        };

        const validated = insertAnalysisSchema.parse(analysisData);
        const analysis = await storage.createAnalysis(validated);

        res.json(analysis);
      } catch (error: any) {
        console.error("Erro na análise:", error);
        const statusCode = error.status || 500;
        res.status(statusCode).json({
          error: "Erro ao processar análise",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }
  );

  app.get("/api/analyses", async (_req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Erro ao buscar análises:", error);
      res.status(500).json({ error: "Erro ao buscar análises" });
    }
  });

  app.delete("/api/analyses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAnalysis(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Análise não encontrada" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar análise:", error);
      res.status(500).json({ error: "Erro ao deletar análise" });
    }
  });

  app.get("/api/analyses/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      const analyses = await storage.getAllAnalyses();
      const analysis = analyses.find(a => a.id === id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Análise não encontrada" });
      }

      const doc = generatePDF(analysis);
      
      const filename = `relatorio-analise-${id}-${Date.now()}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      doc.on('error', (err) => {
        console.error('Erro ao gerar PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erro ao gerar PDF' });
        }
      });

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro ao gerar PDF" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
