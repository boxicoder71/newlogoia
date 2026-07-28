import { useState } from "react";
import type { Proposal } from "./types";

type Props = {
  proposal: Proposal;
  refining: boolean;
  onRefine: (instruction: string) => void;
  onPickVersion: (index: number) => void;
  onDownload: () => void;
};

const SUGGESTIONS = [
  "Deixe mais minimalista",
  "Troque para tons de verde",
  "Remova o ícone, deixe só tipografia",
  "Aumente o símbolo",
  "Versão em preto e branco",
];

export function RefinePanel({ proposal, refining, onRefine, onPickVersion, onDownload }: Props) {
  const [text, setText] = useState("");
  const version = proposal.versions[proposal.currentIndex];

  function submit(instruction: string) {
    const value = instruction.trim();
    if (!value || refining) return;
    onRefine(value);
    setText("");
  }

  return (
    <aside className="studio-panel flex flex-col gap-4 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Refinamento</p>
        <h2 className="font-display text-lg font-semibold">{proposal.name}</h2>
      </div>

      <div className="checkerboard flex aspect-square items-center justify-center rounded-md border border-border bg-background/60">
        {version ? (
          <img
            src={version.src}
            alt={`Versão atual da logo ${proposal.name}`}
            className={`h-full w-full object-contain transition-[filter] duration-500 ${
              version.final ? "blur-0" : "blur-xl"
            }`}
          />
        ) : (
          <span className="text-xs text-muted-foreground">Gerando…</span>
        )}
      </div>

      {proposal.versions.length > 1 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Histórico de versões
          </p>
          <div className="flex flex-wrap gap-2">
            {proposal.versions.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPickVersion(i)}
                title={v.label}
                className={`checkerboard h-14 w-14 overflow-hidden rounded border transition ${
                  i === proposal.currentIndex
                    ? "border-primary studio-glow"
                    : "border-border opacity-70 hover:opacity-100"
                }`}
              >
                <img src={v.src} alt={v.label} className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={refining}
            onClick={() => submit(s)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className="flex gap-2"
      >
        <input
          value={text}
          maxLength={240}
          onChange={(e) => setText(e.target.value)}
          placeholder="Peça um ajuste em português…"
          className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={refining || !text.trim()}
          className="shrink-0 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          {refining ? "…" : "Ajustar"}
        </button>
      </form>

      <button
        type="button"
        onClick={onDownload}
        disabled={!version?.final}
        className="rounded-md border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-40"
      >
        Baixar PNG em alta
      </button>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Imagens geradas por IA incluem marca d'água invisível SynthID. Verifique a
        disponibilidade de registro da marca antes do uso comercial.
      </p>
    </aside>
  );
}