import { Spinner } from "./Spinner";

type Props = {
  proposalName: string;
  price: string;
  processing: boolean;
  onPay: () => void;
  onClose: () => void;
};

export function PaywallDialog({ proposalName, price, processing, onPay, onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Liberar download da logo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
    >
      <div className="studio-panel w-full max-w-md p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Liberar download
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold">{proposalName}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Você escolheu esta proposta. Para baixar os arquivos finais é necessário concluir o
          pagamento. Depois disso o download fica liberado para esta logo.
        </p>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          <li>— PNG 2048×2048 sem fundo</li>
          <li>— SVG sem fundo</li>
          <li>— Uso comercial da arte gerada</li>
        </ul>
        <p className="mt-4 font-display text-2xl font-semibold">{price}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onPay}
            disabled={processing}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {processing && <Spinner />}
            {processing ? "Abrindo pagamento…" : "Pagar e baixar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}