import { createFileRoute, Link } from "@tanstack/react-router";

const DESC =
  "Como o Rebrand IA coleta, usa, armazena e exclui os dados do briefing e as imagens de logo enviadas, conforme a LGPD.";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Rebrand IA" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Política de privacidade — Rebrand IA" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Política de privacidade</h1>
      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        Última atualização: julho de 2026
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Esta política explica como o Rebrand IA trata dados pessoais, em conformidade com a Lei
        Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Ao usar o serviço, você concorda
        com as práticas descritas aqui.
      </p>

      <Section title="1. Quem trata os seus dados">
        <p>
          O responsável pelo tratamento (controlador) é o operador do Rebrand IA. Para qualquer
          assunto relacionado a privacidade, use a página de{" "}
          <Link to="/contato" className="text-primary underline underline-offset-4">
            contato
          </Link>
          .
        </p>
      </Section>

      <Section title="2. Dados que coletamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-foreground">Dados do briefing:</strong> nome da empresa, slogan,
            setor, descrição da atividade, público-alvo, palavras da marca, preferências de estilo e
            cores.
          </li>
          <li>
            <strong className="text-foreground">Imagem enviada:</strong> a logo atual, quando você
            opta por enviá-la.
          </li>
          <li>
            <strong className="text-foreground">Dados técnicos:</strong> endereço IP e data/hora das
            requisições, usados exclusivamente para limitar abuso das rotas de geração.
          </li>
          <li>
            <strong className="text-foreground">Dados de pagamento:</strong> processados pelo
            provedor de pagamento; não armazenamos números de cartão.
          </li>
        </ul>
        <p>
          Não pedimos dados sensíveis. Não envie no briefing informações pessoais de terceiros,
          documentos ou dados que você não tenha autorização para compartilhar.
        </p>
      </Section>

      <Section title="3. Para que usamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Gerar o diagnóstico e as propostas de logo solicitadas (execução do contrato).</li>
          <li>Permitir refinamentos e liberar o download após o pagamento.</li>
          <li>Prevenir abuso e fraude nas rotas de geração (legítimo interesse).</li>
          <li>
            Métricas agregadas e anônimas (setor, estilo, tipo de ajuste) para melhorar a qualidade
            das gerações. Esses registros não contêm o nome da sua empresa nem a sua imagem.
          </li>
        </ul>
      </Section>

      <Section title="4. Compartilhamento e IA">
        <p>
          O conteúdo do briefing e a imagem enviada são processados por modelos de inteligência
          artificial do Google (família Gemini), acessados por meio da infraestrutura do Lovable AI
          Gateway, exclusivamente para produzir o resultado que você pediu. Também usamos
          infraestrutura de hospedagem e banco de dados para armazenar os arquivos gerados. Não
          vendemos e não cedemos seus dados para fins de publicidade de terceiros.
        </p>
      </Section>

      <Section title="5. Armazenamento e prazo">
        <p>
          As logos geradas ficam armazenadas no servidor para permitir o download depois do
          pagamento. Arquivos de propostas não adquiridas são elegíveis para exclusão após 7 dias.
          Os registros de IP usados no controle de abuso são descartados em poucas horas. Pedidos
          pagos são mantidos pelo prazo legal aplicável a registros fiscais e contratuais.
        </p>
      </Section>

      <Section title="6. Seus direitos (LGPD)">
        <p>
          Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade
          e exclusão dos seus dados, além de revogar o consentimento. Basta pedir pela página de{" "}
          <Link to="/contato" className="text-primary underline underline-offset-4">
            contato
          </Link>
          ; respondemos em até 15 dias.
        </p>
      </Section>

      <Section title="7. Segurança">
        <p>
          Usamos conexões criptografadas (HTTPS), acesso restrito ao banco de dados e chaves de API
          mantidas apenas no servidor. Nenhum sistema é totalmente imune a incidentes; em caso de
          incidente relevante, comunicaremos os titulares e a ANPD conforme a lei.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          Usamos apenas armazenamento essencial ao funcionamento da ferramenta (manter seu progresso
          durante a sessão). Não usamos cookies de publicidade comportamental de terceiros.
        </p>
      </Section>

      <Section title="9. Alterações">
        <p>
          Podemos atualizar esta política. A data de atualização acima sempre indicará a versão
          vigente.
        </p>
      </Section>

      <Link to="/" className="mt-10 inline-block text-sm text-primary underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  ),
});
