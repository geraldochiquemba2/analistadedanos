import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Groq from "groq-sdk";
import { insertAnalysisSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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

  const content: any[] = [
    {
      type: "text",
      text: `Você é um especialista em análise de danos. Analise detalhadamente as imagens e o contexto fornecido para identificar TODOS os danos visíveis.

${description ? `Contexto adicional fornecido pelo usuário: ${description}` : ""}

Por favor, forneça uma análise detalhada no seguinte formato JSON:

{
  "summary": "Resumo geral completo da análise em português brasileiro, incluindo o tipo de bem analisado e extensão geral dos danos",
  "damageItems": [
    {
      "itemName": "Nome específico do item/componente danificado",
      "itemType": "Categoria do item (ex: Componente Externo, Estrutura, Sistema Elétrico)",
      "severity": "low|moderate|high",
      "description": "Descrição muito detalhada do dano observado, incluindo localização, dimensões aproximadas e características visuais",
      "estimatedImpact": "Impacto funcional, recomendações de reparo e urgência"
    }
  ]
}

Regras importantes:
- Analise CUIDADOSAMENTE cada imagem fornecida
- Identifique TODOS os danos visíveis em todas as imagens
- Classifique severidade: "low" (dano superficial/estético), "moderate" (funcionalidade parcialmente afetada), "high" (dano estrutural/funcional grave)
- Seja extremamente detalhado e profissional nas descrições
- Use português brasileiro formal
- Para cada dano, especifique sua localização precisa
- Se houver múltiplas imagens do mesmo item, consolide em uma única entrada detalhada

Retorne APENAS o objeto JSON válido, sem markdown ou texto adicional.`,
    },
  ];

  for (const file of files) {
    const base64Image = file.buffer.toString("base64");
    const mimeType = file.mimetype || "image/jpeg";
    
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${mimeType};base64,${base64Image}`,
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
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsedResponse = JSON.parse(responseText);

    if (!parsedResponse.damageItems || !Array.isArray(parsedResponse.damageItems)) {
      throw new Error("Resposta da IA em formato inválido");
    }

    return parsedResponse;
  } catch (error) {
    console.error("Erro ao chamar API do Groq:", error);
    if (error instanceof Error) {
      throw new Error(`Falha na análise com IA: ${error.message}`);
    }
    throw new Error("Falha na análise com IA");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post(
    "/api/analyze",
    upload.array("images", 10),
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
      } catch (error) {
        console.error("Erro na análise:", error);
        res.status(500).json({
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
