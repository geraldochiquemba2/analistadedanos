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
      text: `Você é um especialista em análise de danos. Siga esta metodologia OBRIGATÓRIA em 3 ETAPAS:

${description ? `Contexto adicional fornecido pelo usuário: ${description}` : ""}

ETAPA 1 - IDENTIFICAÇÃO DO OBJETO:
Primeiro, identifique o tipo de objeto/bem na imagem (ex: veículo, imóvel, equipamento, etc.)

ETAPA 2 - MAPEAMENTO DE COMPONENTES:
Liste mentalmente TODOS os componentes/elementos que este tipo de objeto possui.

Exemplo para VEÍCULOS (use como referência):
- Elementos Externos: Carroceria, Para-choques (dianteiro/traseiro), Portas, Maçanetas, Capô, Tampa do porta-malas, Para-lamas, Para-brisa, Vidros laterais, Vidros traseiros, Retrovisores externos, Faróis, Lanternas traseiras, Luzes de freio, Setas, Rodas, Pneus, Grades, Emblemas, Antena, Teto solar, Aerofólio, Spoiler, Saias laterais
- Elementos Internos Visíveis: Bancos, Volante, Painel de instrumentos, Console central, Porta-luvas, Cintos de segurança, Tapetes, Revestimentos de porta, Teto interno

Para outros tipos de objetos, considere seus componentes específicos.

ETAPA 3 - ANÁLISE SISTEMÁTICA DE DANOS:
Para CADA componente visível na imagem:
a) Verifique se está presente na imagem
b) Se presente, examine cuidadosamente se há algum dano
c) Se houver dano, liste-o separadamente com todos os detalhes

FORMATO DE SAÍDA JSON:

{
  "summary": "Tipo de bem analisado + resumo geral da análise incluindo quantos componentes foram examinados e extensão geral dos danos",
  "damageItems": [
    {
      "itemName": "Nome específico do componente danificado (ex: Para-choque Dianteiro, Porta Traseira Esquerda)",
      "itemType": "Categoria do componente (ex: Elemento Externo - Carroceria, Iluminação, Vidros)",
      "severity": "low|moderate|high",
      "description": "Descrição muito detalhada do dano observado, incluindo: tipo de dano (arranhão/amassado/rachadura/etc), localização precisa no componente, dimensões aproximadas, características visuais",
      "estimatedImpact": "Impacto funcional, recomendações de reparo e urgência"
    }
  ]
}

Regras OBRIGATÓRIAS:
- Examine SISTEMATICAMENTE cada componente visível na imagem
- NÃO PULE nenhum componente - verifique todos que estão visíveis
- Para CADA dano encontrado, crie uma entrada separada na lista
- Identifique ABSOLUTAMENTE TODOS os danos visíveis SEM NENHUM LIMITE DE QUANTIDADE
- Cada arranhão, rachadura, amassado, desgaste, mancha, quebra DEVE ser listado separadamente
- Mesmo danos pequenos e superficiais devem ser incluídos na lista completa
- Classifique severidade: "low" (dano superficial/estético), "moderate" (funcionalidade parcialmente afetada), "high" (dano estrutural/funcional grave)
- Seja extremamente detalhado e profissional nas descrições
- Use português brasileiro formal
- Para cada dano, especifique sua localização precisa no componente
- Liste TODO E QUALQUER dano que você conseguir ver, não importa quão pequeno

IMPORTANTE: A lista deve ser COMPLETA e EXAUSTIVA. Verifique cada componente visível e liste todos os danos sem exceção. Não omita nada.

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
      max_tokens: 8192,
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
