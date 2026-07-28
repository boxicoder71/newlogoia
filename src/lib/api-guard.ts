// Guardas simples para as rotas públicas de API: origem esperada e tamanho de payload.

const ALLOWED_HOSTS = [
  "newlogoia.lovable.app",
  "localhost:8080",
  "127.0.0.1:8080",
];

function hostOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function isAllowedHost(host: string | null, selfHost: string): boolean {
  if (!host) return false;
  if (host === selfHost) return true;
  if (ALLOWED_HOSTS.includes(host)) return true;
  // domínios de preview/deploy da própria plataforma
  const hostname = host.split(":")[0];
  return (
    /(^|\.)lovable\.app$/.test(hostname) ||
    /(^|\.)lovableproject\.com$/.test(hostname) ||
    /(^|\.)lovable\.dev$/.test(hostname) ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

export function checkOrigin(request: Request): Response | null {
  const selfHost = new URL(request.url).host;
  const origin = hostOf(request.headers.get("origin"));
  const referer = hostOf(request.headers.get("referer"));
  const candidate = origin ?? referer;
  if (!candidate || !isAllowedHost(candidate, selfHost)) {
    return new Response("Origem não autorizada", { status: 403 });
  }
  return null;
}

export const MAX_PAYLOAD_BYTES = 8 * 1024 * 1024; // ~6MB de imagem em base64 + briefing

const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 600; // 10 minutos

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    request.headers.get("cf-connecting-ip") ??
    (forwarded ? forwarded.split(",")[0].trim() : null) ??
    request.headers.get("x-real-ip") ??
    "desconhecido"
  );
}

// Limite de 5 requisições por IP a cada 10 minutos, contabilizado no banco
// (consistente entre as instâncias serverless).
export async function checkRateLimit(request: Request, route: string): Promise<Response | null> {
  const ip = clientIp(request);
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("check_api_rate_limit", {
      _ip: ip,
      _route: route,
      _limit: RATE_LIMIT,
      _window_seconds: RATE_WINDOW_SECONDS,
    });
    if (error) {
      console.error(`[rate-limit] falha ao verificar limite em ${route}:`, error.message);
      return null; // não bloqueia usuários legítimos se o contador falhar
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.allowed === false) {
      console.error(
        `[rate-limit] bloqueado ip=${ip} rota=${route} usadas=${row.used} retry_after=${row.retry_after_seconds}s`,
      );
      return new Response(
        `Limite de ${RATE_LIMIT} requisições a cada 10 minutos atingido. Tente novamente em ${Math.ceil((row.retry_after_seconds ?? 60) / 60)} minuto(s).`,
        {
          status: 429,
          headers: { "Retry-After": String(row.retry_after_seconds ?? 60) },
        },
      );
    }
    return null;
  } catch (err) {
    console.error(`[rate-limit] erro inesperado em ${route}:`, err);
    return null;
  }
}

// Lê o corpo com limite rígido de bytes; devolve 413 se estourar.
export async function readLimitedJson<T>(
  request: Request,
): Promise<{ data: T } | { response: Response }> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_PAYLOAD_BYTES) {
    return { response: new Response("Payload muito grande (máx. ~6MB)", { status: 413 }) };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_PAYLOAD_BYTES) {
    return { response: new Response("Payload muito grande (máx. ~6MB)", { status: 413 }) };
  }

  try {
    return { data: JSON.parse(text) as T };
  } catch {
    return { response: new Response("JSON inválido", { status: 400 }) };
  }
}