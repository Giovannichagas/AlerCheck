import cors from "cors";
import "dotenv/config";
import express from "express";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ✅ Body esperado do app
const BodySchema = z.object({
  ingredientsText: z.string().min(1),
  allergens: z.array(z.string().min(1)).default([]),
  locale: z.string().optional(), // ex: "pt-BR"
});

app.post("/api/allergen-check", async (req, res) => {
  try {
    const { ingredientsText, allergens, locale } = BodySchema.parse(req.body);

    const system = [
      "Você é um assistente de segurança alimentar.",
      "Seja cuidadoso: não dê diagnóstico médico.",
      "Alergias são assunto sério: recomende cautela, leitura do rótulo e consulta profissional.",
      "Responda SOMENTE em JSON válido (sem markdown).",
    ].join(" ");

    const user = `
Idioma: ${locale ?? "pt-BR"}

Ingredientes do produto (texto livre):
${ingredientsText}

Alergias selecionadas pelo usuário:
${allergens.length ? allergens.join(", ") : "(nenhuma)"}

Tarefa:
1) Verifique se algum ingrediente pode estar relacionado com as alergias do usuário (sinônimos, famílias, traços comuns).
2) Retorne APENAS JSON válido no formato:
{
  "hasRisk": boolean,
  "matched": string[],
  "explanation": string,
  "warning": string,
  "safeAlternatives": string[]
}

Regras:
- matched: itens/derivados encontrados (ex: "ovo", "albumina", "amendoim").
- safeAlternatives: alternativas de substituição da mesma “família/uso” quando possível, sem prometer segurança absoluta.
- warning: inclua aviso de contaminação cruzada e que não substitui orientação médica.
IMPORTANTE: responda APENAS com o JSON. Nada antes, nada depois.
    `.trim();

    const prompt = `${system}\n\n${user}`.trim();

    // ✅ Chamada ao Ollama local
    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2",
        prompt,
        stream: false,
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return res.status(500).json({
        error: "ollama_error",
        details: t,
      });
    }

    const data = await r.json();
    const text = String(data?.response ?? "").trim() || "{}";

    // ✅ Parse seguro (sempre devolve algo útil ao app)
    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      result = {
        hasRisk: false,
        matched: [],
        explanation: "Não foi possível interpretar a resposta do modelo local.",
        warning:
          "Confira manualmente o rótulo/ingredientes (atenção à contaminação cruzada).",
        safeAlternatives: [],
        _raw: text,
      };
    }

    return res.json(result);
  } catch (err: any) {
    // Erro de validação (Zod) ou outro erro
    const msg = err?.message ?? "Erro no servidor";
    return res.status(400).json({ error: msg });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
