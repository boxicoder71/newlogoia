import auroraBefore from "@/assets/aurora-before.jpg";
import auroraAfter from "@/assets/aurora-after.jpg";
import nexlogBefore from "@/assets/nexlog-before.jpg";
import nexlogAfter from "@/assets/nexlog-after.jpg";
import vithaBefore from "@/assets/vitha-before.jpg";
import vithaAfter from "@/assets/vitha-after.jpg";

const EXAMPLES = [
  {
    name: "Padaria Aurora",
    before: auroraBefore,
    after: auroraAfter,
    note: "Tipografia sem hierarquia → wordmark limpo",
  },
  {
    name: "NexLog Transportes",
    before: nexlogBefore,
    after: nexlogAfter,
    note: "Ícone genérico → símbolo geométrico próprio",
  },
  {
    name: "Clínica Vitha",
    before: vithaBefore,
    after: vithaAfter,
    note: "Excesso de detalhes → forma legível em 16px",
  },
];

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-14">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">
        Veja o que a IA consegue fazer
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Exemplos ilustrativos de redesign gerados por IA.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((e) => (
          <div key={e.name} className="studio-panel p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <figure className="relative overflow-hidden rounded-md border border-border bg-white">
                <img
                  src={e.before}
                  alt={`Logo antiga da ${e.name}`}
                  loading="lazy"
                  width={816}
                  height={816}
                  className="aspect-square w-full object-contain"
                />
                <figcaption className="absolute left-1.5 top-1.5 rounded bg-background/85 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Antes
                </figcaption>
              </figure>
              <span className="text-primary">→</span>
              <figure className="relative overflow-hidden rounded-md border border-primary/40 bg-white">
                <img
                  src={e.after}
                  alt={`Nova logo da ${e.name} gerada por IA`}
                  loading="lazy"
                  width={816}
                  height={816}
                  className="aspect-square w-full object-contain"
                />
                <figcaption className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-primary-foreground">
                  Depois
                </figcaption>
              </figure>
            </div>
            <p className="mt-3 text-sm font-medium">{e.name}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{e.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}