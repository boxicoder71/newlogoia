// O navegador nunca recebe a imagem limpa: o servidor devolve apenas a prévia
// com marca d'água embutida e um id para o arquivo final guardado no servidor.
export type GeneratedLogo = { assetId: string; preview: string };

export async function generateLogo(body: {
  prompt: string;
  refImage?: string | null;
  refAssetId?: string | null;
  fast?: boolean;
}): Promise<GeneratedLogo> {
  const res = await fetch("/api/generate-logo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Falha ao gerar imagem (${res.status})`);
  }
  const data = (await res.json()) as GeneratedLogo;
  if (!data.assetId || !data.preview) throw new Error("A geração terminou sem imagem final");
  return data;
}

/** Cria o pedido, confirma o pagamento no servidor e devolve o arquivo sem marca d'água. */
export async function purchaseAndFetchClean(assetId: string): Promise<string> {
  const orderRes = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assetId }),
  });
  if (!orderRes.ok) throw new Error((await orderRes.text()) || "Falha ao abrir o pagamento");
  const { orderId } = (await orderRes.json()) as { orderId: string };

  const confirmRes = await fetch("/api/checkout-confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  if (!confirmRes.ok) throw new Error((await confirmRes.text()) || "Pagamento não confirmado");

  const fileRes = await fetch("/api/download-logo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  if (!fileRes.ok) throw new Error((await fileRes.text()) || "Download não liberado");
  const { image } = (await fileRes.json()) as { image: string };
  return image;
}
