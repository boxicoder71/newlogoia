import { createFileRoute } from "@tanstack/react-router";
import { checkOrigin, checkRateLimit, readLimitedJson } from "@/lib/api-guard";

type Body = {
  prompt: string;
  /** Imagem enviada pelo próprio usuário (logo atual) — permitida. */
  refImage?: string | null;
  /** Refinamento a partir de uma proposta já gerada: só o id, a imagem limpa fica no servidor. */
  refAssetId?: string | null;
  fast?: boolean;
};

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

        const content: unknown[] = [{ type: "text", text: prompt }];
        if (isUuid(refAssetId)) {
          const clean = await getCleanImage(refAssetId);
          if (!clean) return new Response("Proposta não encontrada", { status: 404 });
          content.push({
            type: "image_url",
            image_url: { url: `data:image/png;base64,${clean}` },
          });
        } else if (refImage && refImage.startsWith("data:image/")) {
          content.push({ type: "image_url", image_url: { url: refImage } });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: fast ? "google/gemini-3.1-flash-image" : "google/gemini-3-pro-image",
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          return new Response(text || "Falha na geração", { status: upstream.status });
        }

        const json = await upstream.json();
        const cleanBase64 = extractBase64(json);
        if (!cleanBase64) return new Response("A geração terminou sem imagem", { status: 502 });

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
