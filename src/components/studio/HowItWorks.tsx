const STEPS = [
  { n: "1", title: "Conte sobre a marca", text: "Setor, público e 3 palavras que descrevem a empresa." },
  { n: "2", title: "Receba 4 propostas", text: "Geradas em poucos minutos pela IA, a partir do diagnóstico." },
  { n: "3", title: "Refine e baixe", text: "Ajuste por conversa e exporte em alta resolução, PNG e SVG." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-14">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">Como funciona</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="studio-panel p-5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {s.n}
            </span>
            <p className="mt-3 font-medium">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}