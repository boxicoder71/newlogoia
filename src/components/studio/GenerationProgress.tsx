import { useEffect, useState } from "react";

type Props = { active: boolean; done: number; total: number; analyzing: boolean };

export function GenerationProgress({ active, done, total, analyzing }: Props) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  if (!active) return null;
  const pct = analyzing ? 8 : Math.max(12, Math.round((done / Math.max(1, total)) * 100));

  return (
    <div className="mt-6 studio-panel p-5" role="status" aria-live="polite">
      <p className="text-sm font-medium">
        {analyzing
          ? "Analisando sua marca e montando as direções criativas…"
          : `Gerando suas ${total} propostas — ${done} de ${total} prontas`}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Isso leva cerca de 60 a 90 segundos. Pode deixar a aba aberta · {elapsed}s
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-foreground">
        <span className="animate-bounce" aria-hidden="true">
          ↓
        </span>
        Role a tela para baixo: as propostas aparecem logo abaixo desta barra, uma a uma. Nada
        travou — a página continua carregando enquanto você desce.
      </p>
    </div>
  );
}