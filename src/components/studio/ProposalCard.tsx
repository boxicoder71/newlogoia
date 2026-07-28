import type { Proposal } from "./types";
import { Watermark } from "./Watermark";

type Props = {
  proposal: Proposal;
  selected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
};

export function ProposalCard({ proposal, selected, onSelect, onToggleFavorite }: Props) {
  const version = proposal.versions[proposal.currentIndex];
  return (
    <div
      className={`studio-panel overflow-hidden transition ${selected ? "studio-glow border-primary" : ""}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="checkerboard relative block aspect-square w-full overflow-hidden bg-background/60"
      >
        {version ? (
          <>
            <img
              src={version.src}
              alt={`Proposta ${proposal.name} para a nova logo`}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className={`pointer-events-none h-full w-full select-none object-contain transition-[filter] duration-500 ${
                version.final ? "blur-0" : "blur-xl"
              }`}
            />
            {version.final && <Watermark />}
          </>
        ) : (
          <span className="flex h-full items-center justify-center px-4 text-xs text-muted-foreground">
            {proposal.status === "error" ? proposal.error : "Desenhando…"}
          </span>
        )}
      </button>
      <div className="flex items-start justify-between gap-3 border-t border-border p-3">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold">{proposal.name}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{proposal.rationale}</p>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={proposal.favorite ? "Desfavoritar proposta" : "Favoritar proposta"}
          className={`shrink-0 rounded-md border px-2 py-1 text-sm transition ${
            proposal.favorite
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          ★
        </button>
      </div>
    </div>
  );
}