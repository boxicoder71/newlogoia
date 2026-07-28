import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Rebrand IA" },
      { name: "description", content: "Como o Rebrand IA coleta, usa e protege os dados enviados no briefing e nas imagens de logo." },
      { property: "og:title", content: "Política de privacidade — Rebrand IA" },
      { property: "og:description", content: "Como o Rebrand IA coleta, usa e protege os dados enviados no briefing e nas imagens de logo." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Política de privacidade</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Conteúdo em preparação. Em resumo: usamos as informações do briefing e a imagem enviada
        apenas para gerar as propostas de logo solicitadas.
      </p>
      <Link to="/" className="mt-8 inline-block text-sm text-primary underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  ),
});