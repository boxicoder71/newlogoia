import { createFileRoute } from "@tanstack/react-router";
import { checkOrigin, checkRateLimit, readLimitedJson } from "@/lib/api-guard";

type Body = {
  prompt: string;
  /** Imagem enviada pelo próprio usuário (logo atual) — permitida. */
  refImage?: string | null;
  /** Refinamento a partir de uma proposta já gerada: só o id, a imagem limpa fica no servidor. */
  refAssetId?: string | null;
  fast?: boolean;
  /** Dados que a autoverificação usa para reprovar logos com texto errado. */
  expect?: { company?: string; slogan?: string | null; briefSummary?: string | null };
  /** Contexto anônimo para métricas. */
  meta?: { industry?: string; style?: string; archetype?: string; kind?: "generation" | "refinement"; detail?: string };
};

const MAX_ATTEMPTS = 2;

function extractBase64(json: unknown): string | null {
  const j = json as {
    choices?: {
      message?: { images?: { image_url?: { url?: string } }[]; content?: string };
    }[];
    data?: { b64_json?: string; url?: string }[];
  };
  const url = j.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (url?.startsWith("data:image/")) return url.split(",")[1] ?? null;
  const b64 = j.data?.[0]?.b64_json;
  if (b64) return b64;
  const alt = j.data?.[0]?.url;
  if (alt?.startsWith("data:image/")) return alt.split(",")[1] ?? null;
  return null;
}

export const Route = createFileRoute("/api/generate-logo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const originError = checkOrigin(request);
        if (originError) return originError;

        const limited = await checkRateLimit(request, "generate-logo");
        if (limited) return limited;

        const parsed = await readLimitedJson<Body>(request);
        if ("response" in parsed) return parsed.response;
        const { prompt, refImage, refAssetId, fast } = parsed.data;
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!prompt || prompt.length > 4000) {
          return new Response("Prompt inválido", { status: 400 });
        }

        const { getCleanImage, saveCleanImage, isUuid } = await import("@/lib/logo-assets.server");

        const refBlocks: unknown[] = [];
        if (isUuid(refAssetId)) {
          const clean = await getCleanImage(refAssetId);
          if (!clean) return new Response("Proposta não encontrada", { status: 404 });
          refBlocks.push({
            type: "image_url",
            image_url: { url: `data:image/png;base64,${clean}` },
          });
        } else if (refImage && refImage.startsWith("data:image/")) {
          refBlocks.push({ type: "image_url", image_url: { url: refImage } });
        }

        const model = fast ? "google/gemini-3.1-flash-image" : "google/gemini-3-pro-image";
        async function render(text: string, extra: unknown[]): Promise<string | Response> {
          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: [{ type: "text", text }, ...extra] }],
              modalities: ["image", "text"],
            }),
          });
          if (!upstream.ok) {
            const body = await upstream.text().catch(() => "");
            if (upstream.status === 402) {
              return new Response(
                "Os créditos de IA da conta acabaram. Recarregue os créditos do workspace para voltar a gerar propostas.",
                { status: 402 },
              );
            }
            if (upstream.status === 429) {
              return new Response(
                "A IA está sobrecarregada no momento. Tente novamente em alguns instantes.",
                { status: 429 },
              );
            }
            console.error("[generate-logo] falha no gateway de IA:", upstream.status, body.slice(0, 300));
            return new Response(body || "Falha na geração", { status: upstream.status });
          }
          const image = extractBase64(await upstream.json());
          return image ?? new Response("A geração terminou sem imagem", { status: 502 });
        }

        const { critiqueLogo, retryPrompt } = await import("@/lib/logo-critique.server");
        const { trackEvent } = await import("@/lib/logo-metrics.server");
        const company = parsed.data.expect?.company?.trim() ?? "";

        let cleanBase64 = "";
        let attempts = 0;
        let lastReason = "";
        let currentPrompt = prompt;
        let currentRefs = refBlocks;

        // Loop de autoverificação: o usuário só recebe uma versão aprovada
        // (ou a melhor tentativa, se o limite for atingido).
        while (attempts < MAX_ATTEMPTS) {
          attempts += 1;
          const result = await render(currentPrompt, currentRefs);
          if (typeof result !== "string") {
            if (attempts > 1 && cleanBase64) break; // mantém a última tentativa válida
            return result;
          }
          cleanBase64 = result;

          if (!company) break; // sem nome esperado não há o que auditar

          const critique = await critiqueLogo(cleanBase64, {
            company,
            slogan: parsed.data.expect?.slogan ?? null,
            briefSummary: parsed.data.expect?.briefSummary ?? null,
          }, key);
          if (critique.approved) break;

          lastReason = critique.issues.join("; ").slice(0, 160);
          void trackEvent({
            event: "critique_rejected",
            industry: parsed.data.meta?.industry,
            style: parsed.data.meta?.style,
            archetype: parsed.data.meta?.archetype,
            attempts,
            reason: lastReason || "texto incorreto",
          });
          if (attempts >= MAX_ATTEMPTS) break;

          // Nova tentativa corrigindo a versão reprovada, usando o feedback da revisão.
          currentPrompt = retryPrompt(prompt, critique, company);
          currentRefs = [
            ...refBlocks,
            { type: "image_url", image_url: { url: `data:image/png;base64,${cleanBase64}` } },
          ];
        }

        if (!cleanBase64) return new Response("A geração terminou sem imagem", { status: 502 });

        void trackEvent({
          event: parsed.data.meta?.kind === "refinement" ? "refinement" : "generation",
          industry: parsed.data.meta?.industry,
          style: parsed.data.meta?.style,
          archetype: parsed.data.meta?.archetype,
          detail: parsed.data.meta?.detail,
          attempts,
          reason: lastReason || null,
        });

        const assetId = await saveCleanImage(cleanBase64);

        const { watermarkPngBase64 } = await import("@/lib/logo-watermark.server");
        let preview: string;
        try {
          preview = watermarkPngBase64(cleanBase64);
        } catch (e) {
          console.error("[watermark] falha ao marcar imagem:", e);
          return new Response("Falha ao preparar a prévia", { status: 500 });
        }

        return Response.json({ assetId, preview: `data:image/png;base64,${preview}` });
      },
    },
  },
});
