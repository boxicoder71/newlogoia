import { createFileRoute } from "@tanstack/react-router";
import { checkOrigin, readLimitedJson } from "@/lib/api-guard";

// Entrega a imagem final SEM marca d'água somente quando o pagamento
// do pedido está confirmado no banco (verificação feita no servidor).
export const Route = createFileRoute("/api/download-logo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const originError = checkOrigin(request);
        if (originError) return originError;

        const parsed = await readLimitedJson<{ orderId?: string }>(request);
        if ("response" in parsed) return parsed.response;

        const { getPaidCleanImage, isUuid } = await import("@/lib/logo-assets.server");
        const orderId = parsed.data.orderId;
        if (!isUuid(orderId)) return new Response("Pedido inválido", { status: 400 });

        const clean = await getPaidCleanImage(orderId);
        if (!clean) return new Response("Pagamento não confirmado", { status: 402 });

        return Response.json({ image: `data:image/png;base64,${clean}` });
      },
    },
  },
});
