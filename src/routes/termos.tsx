import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Rebrand IA" },
      { name: "description", content: "Regras de uso do Rebrand IA, direitos sobre as logos geradas e limites do serviço de redesign com IA." },
      { property: "og:title", content: "Termos de uso — Rebrand IA" },
      { property: "og:description", content: "Regras de uso do Rebrand IA, direitos sobre as logos geradas e limites do serviço de redesign com IA." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Termos de uso</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Conteúdo em preparação. As logos são geradas por inteligência artificial e a verificação de
        disponibilidade de registro da marca é responsabilidade do usuário.
      </p>
      <Link to="/" className="mt-8 inline-block text-sm text-primary underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  ),
});