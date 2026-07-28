import { useState } from "react";
import type { Proposal } from "./types";
import { Spinner } from "./Spinner";
import { Watermark } from "./Watermark";

type Props = {
  proposal: Proposal;
  refining: boolean;
  paid: boolean;
  exporting: boolean;
  onRefine: (instruction: string) => void;
  onPickVersion: (index: number) => void;
  onResetToOriginal: () => void;
  onDownload: (format: "png" | "svg") => void;
};

const SUGGESTIONS = [
  "Deixe mais minimalista",
  "Troque para tons de verde",
  "Remova o ícone, deixe só tipografia",
  "Aumente o símbolo",
  "Versão em preto e branco",
];

export function RefinePanel({
  proposal,
  refining,
  paid,
  exporting,
  onRefine,
  onPickVersion,
  onResetToOriginal,
  onDownload,
}: Props) {
  const [text, setText] = useState("");
  const version = proposal.versions[proposal.currentIndex];
  const hasEdits = proposal.versions.length > 1;
  const ready = Boolean(version?.final) && !refining;

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

      <div className="checkerboard relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-border bg-background/60">
        {version ? (
          <>
            <img
              src={version.src}
              alt={`Versão atual da logo ${proposal.name}`}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className={`pointer-events-none h-full w-full select-none object-contain transition-[filter] duration-500 ${
                version.final ? "blur-0" : "blur-xl"
              }`}
            />
            {version.final && !paid && <Watermark />}
          </>
        ) : (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner /> Gerando…
          </span>
        )}
      </div>

      {!paid && (
        <p className="text-center text-[11px] text-muted-foreground">
          A marca d'água some no arquivo final, após o pagamento.
        </p>
      )}

      <p className="rounded-md border border-border bg-background/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Ajustes são opcionais. Se já gostou desta proposta, siga direto para o download. Se pedir
        um ajuste, você só paga depois de aprovar o resultado.
      </p>

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
          id="refine-input"
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

      {hasEdits && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!ready}
            onClick={() => onDownload("png")}
            className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/10 disabled:opacity-40"
          >
            Gostei da alteração
          </button>
          <button
            type="button"
            disabled={refining}
            onClick={() => document.getElementById("refine-input")?.focus()}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            Quero fazer outra alteração
          </button>
          <button
            type="button"
            disabled={refining}
            onClick={onResetToOriginal}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            Voltar ao início
          </button>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onDownload("png")}
          disabled={!ready || exporting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          {exporting && <Spinner />}
          {paid ? "Baixar PNG sem fundo" : "Baixar PNG (pago)"}
        </button>
        <button
          type="button"
          onClick={() => onDownload("svg")}
          disabled={!ready || exporting}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-40"
        >
          {paid ? "Baixar SVG sem fundo" : "Baixar SVG (pago)"}
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Imagens geradas por IA incluem marca d'água invisível SynthID. Verifique a
        disponibilidade de registro da marca antes do uso comercial.
      </p>
    </aside>
  );
}