import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Groq from "groq-sdk";
import { insertAnalysisSchema } from "@shared/schema";
import multer from "multer";

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
  description: string
): Promise<any> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY não configurada");
  }

  console.log("🔍 ETAPA 1: Análise visual com Llama 4 Scout Vision...");
  
  // ETAPA 1: Llama Vision analisa as imagens
  const visualAnalysis = await analyzeWithVision(files, description);
  
  console.log("🧠 ETAPA 2: Raciocínio profundo com Llama 3.3 70B...");
  
  // ETAPA 2: Llama 3.3 70B faz análise sistemática profunda
  const deepAnalysis = await analyzeWithReasoning(visualAnalysis, description);
  
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
   - O componente em si
   - Seu estado (perfeito, danificado, sujo, etc.)
   - Todos os danos visíveis (arranhões, amassados, rachaduras, desgastes, manchas, etc.)
   - Localização precisa de cada dano
   - Tamanho aproximado dos danos

Exemplo para VEÍCULOS - componentes possíveis:
- Externos: Carroceria, Para-choques, Portas, Maçanetas, Capô, Porta-malas, Para-lamas, Para-brisa, Vidros, Retrovisores, Faróis, Lanternas, Rodas, Pneus, Grades, Emblemas
- Internos: Bancos, Volante, Painel, Console, Tapetes, Revestimentos

IMPORTANTE:
- Seja EXTREMAMENTE detalhado
- Não omita NENHUM componente visível
- Não omita NENHUM dano, por menor que seja
- Descreva a localização precisa de cada dano

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
  userDescription: string
): Promise<any> {
  const prompt = `Você é um especialista em análise sistemática de danos com raciocínio avançado. 

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

FORMATO DE SAÍDA JSON OBRIGATÓRIO:

{
  "summary": "Tipo de bem + resumo dos danos identificados visualmente nas imagens analisadas",
  "damageItems": [
    {
      "itemName": "Nome ESPECÍFICO do componente com LADO especificado (ex: Para-choque Dianteiro, Porta Traseira Esquerda, Farol Direito, Retrovisor Esquerdo, Para-lama Dianteiro Direito)",
      "itemType": "Categoria (ex: Elemento Externo - Carroceria, Iluminação, Vidros)",
      "severity": "low|moderate|high",
      "description": "Descrição MUITO detalhada do dano VISÍVEL: tipo (arranhão/amassado/rachadura/etc), localização PRECISA no componente incluindo o LADO (esquerdo/direito/dianteiro/traseiro/superior/inferior/central), dimensões, características visuais",
      "estimatedImpact": "Impacto funcional, recomendações de reparo e urgência"
    }
  ]
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
- SEMPRE especifique o LADO do componente (esquerdo, direito, dianteiro, traseiro, central, superior, inferior)
- No campo "itemName", inclua o lado: "Porta Dianteira Esquerda" em vez de apenas "Porta"
- Na descrição, especifique a posição exata do dano dentro do componente

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
        const { description = "" } = req.body;

        if (!files || files.length === 0) {
          return res.status(400).json({ error: "Nenhuma imagem fornecida" });
        }

        if (!process.env.GROQ_API_KEY) {
          return res.status(500).json({ 
            error: "Configuração ausente",
            details: "GROQ_API_KEY não está configurada no servidor"
          });
        }

        const groqResponse = await analyzeImagesWithGroq(files, description);

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

  const httpServer = createServer(app);
  return httpServer;
}
