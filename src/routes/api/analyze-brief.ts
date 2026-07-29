import { createFileRoute } from "@tanstack/react-router";
import { checkOrigin, checkRateLimit, readLimitedJson } from "@/lib/api-guard";
import {
  ARCHETYPES,
  MINIMALISM_RULES,
  STYLE_DIRECTIVES,
  baseImageRules,
  sectorGuidance,
} from "@/lib/logo-knowledge";

export type Brief = {
  company: string;
  slogan?: string;
  industry: string;
  description: string;
  audience: string;
  keywords: string;
  style: string;
  colors: string;
  avoid?: string;
  usage?: string;
  references?: string;
};

export type Analysis = {
  diagnosis: { summary: string; weaknesses: string[]; keep: string[] };
  directions: { name: string; rationale: string; prompt: string; archetype?: string }[];
};

const SYSTEM = `Você é diretor de arte sênior especializado em identidade visual MINIMALISTA. Todas as propostas devem ser minimalistas: pouquíssimos elementos, sem ornamento, sem ilustração, no máximo duas cores chapadas.
Responda SEMPRE em português do Brasil, exceto os prompts de geração de imagem, que devem ser escritos em inglês.
Você receberá arquétipos numerados. Gere exatamente uma direção por arquétipo, na mesma quantidade, na MESMA ORDEM, e cada direção deve obedecer estritamente ao arquétipo correspondente (composição, clima e paleta). Não repita a mesma ideia em dois arquétipos: elas precisam ser visivelmente diferentes entre si.
Cada "prompt" deve ser um parágrafo em inglês descrevendo a logo concretamente: composição, símbolo (ou ausência dele), estilo tipográfico, paleta com cores nomeadas, e o texto exato a ser desenhado.
Nunca reproduza marcas registradas ou IPs existentes. Se o briefing pedir isso, crie algo original.
Retorne APENAS JSON válido no formato:
{"diagnosis":{"summary":string,"weaknesses":[string],"keep":[string]},"directions":[{"name":string,"rationale":string,"prompt":string}]}`;

export const Route = createFileRoute("/api/analyze-brief")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const originError = checkOrigin(request);
        if (originError) return originError;

        const limited = await checkRateLimit(request, "analyze-brief");
        if (limited) return limited;

        const parsed = await readLimitedJson<{ brief: Brief; image?: string | null }>(request);
        if ("response" in parsed) return parsed.response;
        const { brief, image } = parsed.data;
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!brief?.company) return new Response("Briefing incompleto", { status: 400 });

        const { promptHintsFor } = await import("@/lib/logo-metrics.server");
        const hints = await promptHintsFor(brief.industry);
        const sector = sectorGuidance(brief.industry);
        const slogan = brief.slogan?.trim() || null;

        const archetypeBlock = ARCHETYPES.map(
          (a, i) => `${i + 1}. ${a.composition} · ${a.mood} → ${a.directive}`,
        ).join("\n");

        const briefText = `Empresa: ${brief.company}
Slogan na logo: ${slogan ?? "nenhum (não incluir texto extra)"}
Setor: ${brief.industry}
Descrição: ${brief.description}
Público-alvo: ${brief.audience}
Palavras da marca: ${brief.keywords}
Estilo preferido: ${brief.style}
Cores: ${brief.colors || "a IA decide"}
Evitar: ${brief.avoid || "nada específico"}
Onde será usada: ${brief.usage || "não informado"}
Marcas admiradas (referência de clima, nunca copiar): ${brief.references || "não informado"}

Diretrizes obrigatórias do setor (aplicar em todas as direções):
${sector}

Arquétipos obrigatórios, nesta ordem:
${archetypeBlock}
${hints ? `\n${hints}` : ""}
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
          if (res.status === 402) {
            return new Response(
              "Os créditos de IA da conta acabaram. Recarregue os créditos do workspace para voltar a gerar propostas.",
              { status: 402 },
            );
          }
          if (res.status === 429) {
            return new Response(
              "A IA está sobrecarregada no momento. Tente novamente em alguns instantes.",
              { status: 429 },
            );
          }
          console.error("[analyze-brief] falha no gateway de IA:", res.status, text.slice(0, 300));
          return new Response(text || "Falha na análise", { status: res.status });
        }

        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const raw = json.choices?.[0]?.message?.content ?? "";
        const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
        let analysis: Analysis;
        try {
          analysis = JSON.parse(cleaned) as Analysis;
        } catch {
          return new Response("Resposta da IA em formato inesperado", { status: 502 });
        }

        // O servidor garante o arquétipo e as regras técnicas em cada prompt,
        // mesmo que o modelo tenha sido criativo demais na resposta.
        const rules = baseImageRules(brief.company, slogan);
        const styleDirective = STYLE_DIRECTIVES[brief.style];
        const styleLine = styleDirective ? `Style focus: ${styleDirective}.` : "";
        analysis.directions = ARCHETYPES.map((a, i) => {
          const d = analysis.directions?.[i];
          return {
            name: d?.name || a.composition,
            rationale: d?.rationale || `${a.composition} com clima ${a.mood.toLowerCase()}.`,
            archetype: a.id,
            prompt: `${d?.prompt ?? ""}
Structure (mandatory): ${a.directive}.
Sector guidance: ${sector}
${brief.avoid ? `Avoid: ${brief.avoid}.` : ""}
${styleLine}
${MINIMALISM_RULES}
${rules}`.trim(),
          };
        });

        return Response.json(analysis);
      },
    },
  },
});
