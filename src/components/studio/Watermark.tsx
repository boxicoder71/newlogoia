type Props = {
  label?: string;
  dense?: boolean;
};

/** Overlay de marca d'água exibido sobre as prévias antes do pagamento. */
export function Watermark({ label = "REBRAND IA · PRÉVIA", dense = false }: Props) {
  const rows = dense ? 5 : 7;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      <div className="absolute inset-0 flex -rotate-[24deg] scale-150 flex-col justify-center gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-center gap-6 whitespace-nowrap">
            {Array.from({ length: 4 }).map((__, j) => (
              <span
                key={j}
                className={`font-display font-semibold uppercase tracking-[0.3em] text-foreground/25 mix-blend-overlay ${
                  dense ? "text-[9px]" : "text-[11px]"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
