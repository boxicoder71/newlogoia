const POINTS = [
  {
    title: "O que você precisa ter em mãos",
    text: "Nome da empresa, o que ela faz e, se tiver, a logo atual. Leva menos de 2 minutos para preencher.",
  },
  {
    title: "O que a IA devolve",
    text: "Um diagnóstico da marca e 6 propostas de logo diferentes entre si, prontas para comparar.",
  },
  {
    title: "Quanto custa",
    text: "Gerar e refinar é grátis. Você só paga ao baixar a proposta escolhida em PNG e SVG sem fundo.",
  },
];

export function BeforeForm() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-8">
      <div className="studio-panel p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-primary">Comece agora</p>
        <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          Vamos ao passo 1: conte sobre a sua marca
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Quanto mais claro o briefing, mais precisas ficam as propostas. Preencha o formulário
          abaixo — os campos opcionais ajudam, mas não são obrigatórios.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title} className="rounded-md border border-border bg-background/40 p-4">
              <p className="text-sm font-medium">{p.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}