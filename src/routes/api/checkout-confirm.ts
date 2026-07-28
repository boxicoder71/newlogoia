import { createFileRoute } from "@tanstack/react-router";
import { checkOrigin, checkRateLimit, readLimitedJson } from "@/lib/api-guard";

// Confirmação de pagamento. Enquanto o provedor real (Stripe/Paddle) não está
// conectado, este endpoint simula a aprovação — quando o checkout real entrar,
// basta trocar o corpo por uma verificação de webhook assinado do provedor.
export const Route = createFileRoute("/api/checkout-confirm")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const originError = checkOrigin(request);
        if (originError) return originError;
        const limited = await checkRateLimit(request, "checkout-confirm");
        if (limited) return limited;

        const parsed = await readLimitedJson<{ orderId?: string }>(request);
        if ("response" in parsed) return parsed.response;

        const { markOrderPaid, isUuid } = await import("@/lib/logo-assets.server");
        const orderId = parsed.data.orderId;
        if (!isUuid(orderId)) return new Response("Pedido inválido", { status: 400 });
        const ok = await markOrderPaid(orderId);
        if (!ok) return new Response("Pedido não encontrado ou já processado", { status: 409 });
        const { trackEvent } = await import("@/lib/logo-metrics.server");
        void trackEvent({ event: "purchase" });
        return Response.json({ status: "paid" });
      },
    },
  },
});
