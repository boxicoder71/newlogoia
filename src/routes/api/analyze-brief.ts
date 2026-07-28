import { createFileRoute } from "@tanstack/react-router";

export type Brief = {
  company: string;
  industry: string;
  description: string;
  audience: string;
  keywords: string;
  style: string;
  colors: string;
};

export type Analysis = {
  diagnosis: { summary: string; weaknesses: string[]; keep: string[] };
  directions: { name: string; rationale: string; prompt: string }[];
};

const SYSTEM = `Você é diretor de arte sênior especializado em identidade visual e redesign de logos.
Responda SEMPRE em português do Brasil, exceto os prompts de geração de imagem, que devem ser escritos em inglês.
Boas práticas obrigatórias em cada prompt de geração:
- logo vetorial, formas limpas, fundo sólido branco liso, sem mockup, sem sombra realista
- o nome exato da empresa deve aparecer com tipografia legível e ortografia correta
- legível em tamanho pequeno (favicon), funciona em preto e branco, sem gradientes complexos ou detalhes excessivos
- composição centralizada com margem generosa
Nunca reproduza marcas registradas ou IPs existentes. Se o briefing pedir isso, crie algo original.
Retorne APENAS JSON válido no formato:
{"diagnosis":{"summary":string,"weaknesses":[string],"keep":[string]},"directions":[{"name":string,"rationale":string,"prompt":string}]}
Gere exatamente 6 direções distintas entre si.`;

export const Route = createFileRoute("/api/analyze-brief")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { brief, image } = (await request.json()) as { brief: Brief; image?: string | null };
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!brief?.company) return new Response("Briefing incompleto", { status: 400 });

        const briefText = `Empresa: ${brief.company}
Setor: ${brief.industry}
Descrição: ${brief.description}
Público-alvo: ${brief.audience}
Palavras da marca: ${brief.keywords}
Estilo preferido: ${brief.style}
Cores: ${brief.colors || "a IA decide"}
${image ? "Uma logo atual foi enviada — analise-a criticamente." : "A empresa não possui logo atual; diagnosis.summary deve explicar a oportunidade de criar do zero e weaknesses/keep podem vir vazios."}`;

        const userContent: unknown[] = [{ type: "text", text: briefText }];
        if (image && image.startsWith("data:image/")) {
          userContent.push({ type: "image_url", image_url: { url: image } });
        }

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return new Response(text || "Falha na análise", { status: res.status });
        }

        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const raw = json.choices?.[0]?.message?.content ?? "";
        const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
        try {
          const parsed = JSON.parse(cleaned) as Analysis;
          return Response.json(parsed);
        } catch {
          return new Response("Resposta da IA em formato inesperado", { status: 502 });
        }
      },
    },
  },
});