import { createFileRoute } from "@tanstack/react-router";

// Diagnóstico de configuração: informa apenas se cada variável existe.
// Nenhum valor de segredo é exposto.
export const Route = createFileRoute("/api/public/env-status")({
  server: {
    handlers: {
      GET: async () => {
        const names = [
          "LOVABLE_API_KEY",
          "SUPABASE_URL",
          "SUPABASE_SERVICE_ROLE_KEY",
          "SUPABASE_PUBLISHABLE_KEY",
        ] as const;
        const configured = Object.fromEntries(
          names.map((n) => [n, Boolean(process.env[n])]),
        ) as Record<(typeof names)[number], boolean>;

        let databaseReachable = false;
        if (configured.SUPABASE_URL && configured.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { error } = await supabaseAdmin
              .from("api_rate_limits")
              .select("id", { count: "exact", head: true });
            databaseReachable = !error;
          } catch {
            databaseReachable = false;
          }
        }

        const ok = Object.values(configured).every(Boolean) && databaseReachable;
        return Response.json({ ok, configured, databaseReachable }, { status: ok ? 200 : 503 });
      },
    },
  },
});
