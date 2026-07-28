import { createFileRoute } from "@tanstack/react-router";
import { checkOrigin, checkRateLimit, readLimitedJson } from "@/lib/api-guard";

type Body = {
  prompt: string;
  refImage?: string | null;
  fast?: boolean;
};

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
        const { prompt, refImage, fast } = parsed.data;
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!prompt || prompt.length > 4000) {
          return new Response("Prompt inválido", { status: 400 });
        }

        const content: unknown[] = [{ type: "text", text: prompt }];
        if (refImage && refImage.startsWith("data:image/")) {
          content.push({ type: "image_url", image_url: { url: refImage } });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: fast ? "google/gemini-3.1-flash-image" : "google/gemini-3-pro-image",
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
            stream: true,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          return new Response(text || "Falha na geração", { status: upstream.status });
        }

        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});