import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Rebrand IA" },
      { name: "description", content: "Fale com o time do Rebrand IA sobre propostas de logo, pagamentos, exportações e suporte." },
      { property: "og:title", content: "Contato — Rebrand IA" },
      { property: "og:description", content: "Fale com o time do Rebrand IA sobre propostas de logo, pagamentos, exportações e suporte." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Contato</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Conteúdo em preparação. Em breve publicaremos o e-mail de suporte e o formulário de contato.
      </p>
      <Link to="/" className="mt-8 inline-block text-sm text-primary underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  ),
});