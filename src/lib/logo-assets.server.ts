// Guarda a imagem limpa apenas no servidor e controla os pedidos pagos.

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function saveCleanImage(base64: string): Promise<string> {
  const db = await admin();
  const { data, error } = await db
    .from("logo_assets")
    .insert({ clean_png: base64 })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  void db.rpc("purge_old_logo_assets").then(
    () => {},
    () => {},
  );
  return data.id as string;
}

export async function getCleanImage(assetId: string): Promise<string | null> {
  const db = await admin();
  const { data } = await db.from("logo_assets").select("clean_png").eq("id", assetId).maybeSingle();
  return (data?.clean_png as string | undefined) ?? null;
}

export async function createOrder(assetId: string): Promise<string> {
  const db = await admin();
  const { data, error } = await db
    .from("logo_orders")
    .insert({ asset_id: assetId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function markOrderPaid(orderId: string): Promise<boolean> {
  const db = await admin();
  const { data, error } = await db
    .from("logo_orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

/** Só devolve a imagem limpa se o pedido estiver pago (verificado no servidor). */
export async function getPaidCleanImage(orderId: string): Promise<string | null> {
  const db = await admin();
  const { data } = await db
    .from("logo_orders")
    .select("status, asset_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!data || data.status !== "paid") return null;
  return getCleanImage(data.asset_id as string);
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}
