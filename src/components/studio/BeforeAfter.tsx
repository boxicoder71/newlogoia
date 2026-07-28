const EXAMPLES = [
  { name: "Padaria Aurora", before: "Logo antiga", after: "Nova versão", note: "Tipografia sem hierarquia → wordmark limpo" },
  { name: "NexLog Transportes", before: "Logo antiga", after: "Nova versão", note: "Ícone genérico → símbolo geométrico próprio" },
  { name: "Clínica Vitha", before: "Logo antiga", after: "Nova versão", note: "Excesso de detalhes → forma legível em 16px" },
];

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-14">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">
        Veja o que a IA consegue fazer
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((e) => (
          <div key={e.name} className="studio-panel p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="checkerboard flex aspect-square items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                {e.before}
              </div>
              <span className="text-primary">→</span>
              <div className="flex aspect-square items-center justify-center rounded-md border border-primary/40 bg-primary/5 text-xs text-foreground">
                {e.after}
              </div>
            </div>
            <p className="mt-3 text-sm font-medium">{e.name}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{e.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}