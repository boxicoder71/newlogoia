import { createFileRoute } from "@tanstack/react-router";
import { checkOrigin, readLimitedJson } from "@/lib/api-guard";

// Métrica anônima de comportamento (nenhum dado pessoal é aceito aqui).
const ALLOWED = new Set(["selection"]);

export const Route = createFileRoute("/api/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const originError = checkOrigin(request);
        if (originError) return originError;

        const parsed = await readLimitedJson<{
          event?: string;
          industry?: string;
          style?: string;
          archetype?: string;
        }>(request);
        if ("response" in parsed) return parsed.response;
        const { event, industry, style, archetype } = parsed.data;
        if (!event || !ALLOWED.has(event)) return new Response("Evento inválido", { status: 400 });

        const { trackEvent } = await import("@/lib/logo-metrics.server");
        await trackEvent({
          event: "selection",
          industry: industry?.slice(0, 60),
          style: style?.slice(0, 60),
          archetype: archetype?.slice(0, 40),
        });
        return new Response(null, { status: 204 });
      },
    },
  },
});
