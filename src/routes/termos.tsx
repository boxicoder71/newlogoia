import { createFileRoute, Link } from "@tanstack/react-router";

const DESC =
  "Regras de uso do Rebrand IA: como funciona a geração por IA, pagamento de R$ 49, direitos sobre as logos e limites do serviço.";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Rebrand IA" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Termos de uso — Rebrand IA" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Termos de uso</h1>
      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        Última atualização: julho de 2026
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Estes termos regem o uso do Rebrand IA. Ao usar a ferramenta, você declara ter lido e
        aceito as condições abaixo.
      </p>

      <Section title="1. O serviço">
        <p>
          O Rebrand IA gera propostas de logo a partir de um briefing e, opcionalmente, da sua logo
          atual, usando modelos de inteligência artificial. Você recebe 6 propostas, pode pedir
          ajustes por conversa e baixar o arquivo final após o pagamento.
        </p>
      </Section>

      <Section title="2. Pagamento e entrega">
        <ul className="list-disc space-y-1 pl-5">
          <li>Gerar e visualizar as propostas é gratuito; as prévias têm marca d'água.</li>
          <li>
            O download da logo escolhida custa <strong className="text-foreground">R$ 49,00</strong>,
            por logo, pagamento único.
          </li>
          <li>Após a confirmação do pagamento, liberamos PNG em alta resolução e SVG, sem fundo.</li>
        </ul>
      </Section>

      <Section title="3. Direito de arrependimento e reembolso">
        <p>
          Como o produto é digital e entregue imediatamente após o pagamento, você pode solicitar o
          cancelamento em até 7 dias da compra (art. 49 do Código de Defesa do Consumidor), desde
          que não tenha feito uso comercial do arquivo. Também devolvemos o valor se houver falha
          técnica que impeça a entrega do arquivo.
        </p>
      </Section>

      <Section title="4. Direitos sobre a arte">
        <p>
          Após o pagamento, você recebe os direitos de uso comercial da arte adquirida. A arte é
          gerada por IA e, conforme a legislação brasileira, conteúdo gerado por máquina pode não
          ser passível de proteção autoral exclusiva. O registro da marca no INPI é responsabilidade
          sua, assim como a verificação prévia de disponibilidade e de eventual conflito com marcas
          de terceiros.
        </p>
      </Section>

      <Section title="5. Uso aceitável">
        <ul className="list-disc space-y-1 pl-5">
          <li>Não envie conteúdo ilegal, ofensivo ou que viole direitos de terceiros.</li>
          <li>Não tente reproduzir marcas registradas ou personagens protegidos.</li>
          <li>
            Não é permitido automatizar chamadas, contornar limites de uso, remover marca d'água das
            prévias ou revender o acesso à ferramenta.
          </li>
        </ul>
        <p>Podemos suspender o acesso em caso de abuso.</p>
      </Section>

      <Section title="6. Limitações">
        <p>
          Resultados gerados por IA podem conter imprecisões, inclusive em texto e proporções. O
          serviço é fornecido "como está", sem garantia de adequação a uma finalidade específica.
          Nossa responsabilidade limita-se ao valor efetivamente pago pela logo em questão.
        </p>
      </Section>

      <Section title="7. Privacidade">
        <p>
          O tratamento de dados está descrito na{" "}
          <Link to="/privacidade" className="text-primary underline underline-offset-4">
            Política de privacidade
          </Link>
          .
        </p>
      </Section>

      <Section title="8. Foro e alterações">
        <p>
          Estes termos são regidos pela legislação brasileira. Podemos atualizá-los; a data acima
          indica a versão vigente. Dúvidas pela página de{" "}
          <Link to="/contato" className="text-primary underline underline-offset-4">
            contato
          </Link>
          .
        </p>
      </Section>

      <Link to="/" className="mt-10 inline-block text-sm text-primary underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  ),
});
