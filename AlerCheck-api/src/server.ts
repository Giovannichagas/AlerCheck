import cors from "cors";
import "dotenv/config";
import express from "express";
import { z } from "zod";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" })); // ✅ maior por causa de base64

const BodySchema = z.object({
  ingredientsText: z.string().optional().default(""),
  allergens: z.array(z.string().min(1)).default([]),
  locale: z.string().optional(),
  imageBase64: z.string().optional(), // ✅ foto (base64)
});

app.post("/api/allergen-check", async (req, res) => {
  try {
    const { ingredientsText, allergens, locale, imageBase64 } = BodySchema.parse(req.body);

    // normaliza texto do prato (aceita , ; \n)
    const normalizedIngredients = ingredientsText
      .split(/[,;\n]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    if (!normalizedIngredients && !imageBase64) {
      return res.status(400).json({ error: "Informe ingredientesText ou envie imageBase64." });
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

    const user = `
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
Exemplo de motivos: proteína, cálcio, vitamina D, ferro, fibras.

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

    const prompt = `${system}\n\n${user}`.trim();

    const model = imageBase64
      ? (process.env.OLLAMA_VISION_MODEL || "llava")
      : (process.env.OLLAMA_MODEL || "llama3.2");

    const body: any = {
      model,
      prompt,
      stream: false,
    };

    if (imageBase64) body.images = [imageBase64];

    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return res.status(500).json({ error: "ollama_error", details: t });
    }

    const data = await r.json();
    const rawText = String(data?.response ?? "").trim() || "{}";

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
