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
  return /(^|\.)lovable\.app$/.test(host.split(":")[0]);
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