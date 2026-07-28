// Métricas anônimas de uso: nenhum dado pessoal é gravado, só padrões de comportamento
// usados para ajustar os prompts internos.

export type LogoEvent = {
  event:
    | "generation"
    | "refinement"
    | "selection"
    | "purchase"
    | "critique_rejected"
    | "critique_failed";
  industry?: string | null;
  style?: string | null;
  archetype?: string | null;
  /** Texto curto e genérico (ex.: o ajuste pedido). Nunca inclui nome de empresa. */
  detail?: string | null;
  attempts?: number | null;
  reason?: string | null;
};

export async function trackEvent(e: LogoEvent): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("logo_events").insert({
      event: e.event,
      industry: e.industry ?? null,
      style: e.style ?? null,
      archetype: e.archetype ?? null,
      detail: e.detail ? e.detail.slice(0, 160) : null,
      attempts: e.attempts ?? null,
      reason: e.reason ? e.reason.slice(0, 160) : null,
    });
  } catch (err) {
    console.error("[metrics] falha ao registrar evento:", err);
  }
}

/**
 * Resumo dos ajustes mais pedidos no setor, injetado no prompt para que a
 * primeira geração já nasça mais próxima do que os usuários costumam pedir.
 */
export async function promptHintsFor(industry: string): Promise<string> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.rpc("logo_event_trends", {
      _industry: industry,
      _limit: 5,
    });
    const rows = (data ?? []) as { event: string; detail: string; uses: number }[];
    const tweaks = rows.filter((r) => r.event === "refinement" && r.uses > 1).map((r) => r.detail);
    if (!tweaks.length) return "";
    return `Aprendizado da plataforma: neste setor os usuários costumam pedir estes ajustes depois da primeira entrega — ${tweaks.join("; ")}. Já incorpore essas preferências nas direções, sem perder a diversidade estrutural.`;
  } catch (err) {
    console.error("[metrics] falha ao ler tendências:", err);
    return "";
  }
}
