type Props = {
  value: string;
  onChange: (v: string) => void;
};

export const PALETTES: { label: string; value: string; colors: string[] }[] = [
  { label: "Azul corporativo", value: "azul corporativo com cinza", colors: ["#1E3A8A", "#3B82F6", "#94A3B8"] },
  { label: "Verde natural", value: "verde natural e terroso", colors: ["#14532D", "#4D9A5B", "#D9E5C7"] },
  { label: "Preto e dourado", value: "preto com dourado premium", colors: ["#0B0B0B", "#C9A227", "#F1E5C3"] },
  { label: "Vibrante", value: "colorido vibrante e energético", colors: ["#FF3D3D", "#FFB020", "#2BB3FF"] },
  { label: "Pastel", value: "tons pastéis suaves", colors: ["#F6C7C7", "#CDE7E3", "#EBDCC0"] },
  { label: "Monocromático", value: "monocromático preto e branco", colors: ["#111111", "#7A7A7A", "#EDEDED"] },
  { label: "Vinho e creme", value: "vinho profundo com creme", colors: ["#5B1220", "#A33A4A", "#F3E7DA"] },
  { label: "Terracota", value: "terracota e areia", colors: ["#B4562F", "#E39A6B", "#F2E3D0"] },
];

export function PalettePicker({ value, onChange }: Props) {
  const custom = value.startsWith("#");
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onChange("")}
          className={`rounded-md border px-3 py-2 text-left text-sm transition ${
            value === ""
              ? "border-primary bg-primary/10 text-foreground studio-glow"
              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          <span className="block font-medium">Deixar a IA sugerir</span>
          <span className="block text-[11px] opacity-70">Escolha automática</span>
        </button>
        {PALETTES.map((p) => {
          const active = value === p.value;
          return (
            <button
              type="button"
              key={p.value}
              onClick={() => onChange(p.value)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                active
                  ? "border-primary bg-primary/10 text-foreground studio-glow"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <span className="mb-1.5 flex gap-1">
                {p.colors.map((c) => (
                  <span
                    key={c}
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
              <span className="block font-medium">{p.label}</span>
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="color"
          value={custom ? value : "#E8A33D"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-border bg-background"
          aria-label="Cor personalizada"
        />
        Cor personalizada {custom && <span className="text-foreground">({value})</span>}
      </label>
    </div>
  );
}