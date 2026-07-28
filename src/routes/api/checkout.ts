import { createFileRoute } from "@tanstack/react-router";
import { checkOrigin, readLimitedJson } from "@/lib/api-guard";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      // Cria o pedido de download de uma proposta. O pedido nasce "pending":
      // só o servidor pode marcá-lo como pago.
      POST: async ({ request }) => {
        const originError = checkOrigin(request);
        if (originError) return originError;

        const parsed = await readLimitedJson<{ assetId?: string }>(request);
        if ("response" in parsed) return parsed.response;

        const { createOrder, getCleanImage, isUuid } = await import("@/lib/logo-assets.server");
        const assetId = parsed.data.assetId;
        if (!isUuid(assetId)) return new Response("Proposta inválida", { status: 400 });
        if (!(await getCleanImage(assetId))) {
          return new Response("Proposta não encontrada", { status: 404 });
        }
        const orderId = await createOrder(assetId);
        return Response.json({ orderId });
      },
    },
  },
});
