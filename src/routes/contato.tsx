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
        Para suporte, dúvidas sobre pagamento, pedidos de reembolso ou solicitações relacionadas a
        dados pessoais (LGPD), fale com a gente por e-mail.
      </p>
      <p className="mt-4 text-sm text-foreground">
        E-mail:{" "}
        <a
          href="mailto:contato@newlogoia.com.br"
          className="text-primary underline underline-offset-4"
        >
          contato@newlogoia.com.br
        </a>
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Respondemos em até 2 dias úteis. Solicitações de acesso ou exclusão de dados são atendidas
        em até 15 dias, conforme a LGPD.
      </p>
      <Link to="/" className="mt-8 inline-block text-sm text-primary underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  ),
});