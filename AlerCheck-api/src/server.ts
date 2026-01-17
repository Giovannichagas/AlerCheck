import cors from "cors";
import "dotenv/config";
import express from "express";
import { z } from "zod";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "25mb" })); // ✅ maior por causa de base64 (foto)

const BodySchema = z.object({
  ingredientsText: z.string().optional().default(""),
  allergens: z.array(z.string().min(1)).default([]),
  locale: z.string().optional(),
  imageBase64: z.string().optional(), // ✅ pode vir como dataURL OU base64 puro
});

app.post("/api/allergen-check", async (req, res) => {
  try {
    const { ingredientsText, allergens, locale, imageBase64 } = BodySchema.parse(req.body);

    // normaliza texto do prato (aceita , ; \n)
    const normalizedIngredients = (ingredientsText ?? "")
      .split(/[,;\n]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    if (!normalizedIngredients && !imageBase64) {
      return res.status(400).json({ error: "Informe ingredientsText ou envie imageBase64." });
    }

    if (allergens.length === 0) {
      return res.status(400).json({ error: "Selecione pelo menos 1 alergia (allergens)." });
    }

    const system = [
      "Você é um assistente de segurança alimentar.",
      "Seja cuidadoso: não dê diagnóstico médico.",
      "Alergias são assunto sério: recomende cautela, leitura do rótulo e consulta profissional.",
      "Responda SOMENTE em JSON válido (sem markdown).",
    ].join(" ");

    const userPrompt = `
Idioma: ${locale ?? "pt-BR"}

Alergias selecionadas pelo usuário:
${allergens.join(", ")}

Texto do prato digitado pelo usuário:
${normalizedIngredients || "(vazio)"}

Se houver imagem, identifique os alimentos visíveis e SOME ao texto acima.
Depois:
1) Diga se há risco (hasRisk) com base nas alergias.
2) Liste em matched os itens/derivados que batem.
3) Explique brevemente em explanation.
4) warning deve mencionar contaminação cruzada e que não substitui orientação médica.
5) safeAlternatives deve ter pelo menos 3 itens, cada um com motivo nutricional (vitaminas/nutrientes).

Retorne APENAS JSON:
{
  "hasRisk": boolean,
  "matched": string[],
  "explanation": string,
  "warning": string,
  "safeAlternatives": { "item": string, "why": string }[]
}

IMPORTANTE: responda APENAS com o JSON. Nada antes, nada depois.
`.trim();

    const prompt = `${system}\n\n${userPrompt}`.trim();

    const hasImage = !!imageBase64;

    const model = hasImage
      ? (process.env.OLLAMA_VISION_MODEL || "llava")
      : (process.env.OLLAMA_MODEL || "llama3.2");

    // ✅ se vier dataURL, extrai só o base64 puro (Ollama precisa base64 puro)
    const pureBase64 = hasImage
      ? imageBase64!.includes("base64,")
        ? imageBase64!.split("base64,")[1]
        : imageBase64!
      : undefined;

    let rawText = "";

    if (hasImage) {
      // ✅ MULTIMODAL: use /api/chat com messages[].images
      const body = {
        model,
        stream: false,
        messages: [
          {
            role: "user",
            content: prompt,
            images: [pureBase64],
          },
        ],
      };

      const r = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const txt = await r.text().catch(() => "");
      if (!r.ok) {
        return res.status(500).json({ error: "ollama_error", details: txt });
      }

      const data = JSON.parse(txt);
      rawText = String(data?.message?.content ?? "").trim() || "{}";
    } else {
      // ✅ TEXTO: pode usar /api/generate
      const body = {
        model,
        prompt,
        stream: false,
      };

      const r = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const txt = await r.text().catch(() => "");
      if (!r.ok) {
        return res.status(500).json({ error: "ollama_error", details: txt });
      }

      const data = JSON.parse(txt);
      rawText = String(data?.response ?? "").trim() || "{}";
    }

    // tenta extrair JSON mesmo se vier texto extra
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    const candidate = start >= 0 && end > start ? rawText.slice(start, end + 1) : rawText;

    let result: any;
    try {
      result = JSON.parse(candidate);
    } catch {
      result = {
        hasRisk: false,
        matched: [],
        explanation: "Não foi possível interpretar a resposta do modelo local.",
        warning: "Confira manualmente o rótulo/ingredientes (atenção à contaminação cruzada).",
        safeAlternatives: [],
        _raw: rawText,
      };
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Erro no servidor" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
