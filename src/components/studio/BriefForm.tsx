import { useRef, useState } from "react";
import { INDUSTRIES, STYLES, type Brief } from "./types";
import { Spinner } from "./Spinner";

type Props = {
  loading: boolean;
  onSubmit: (brief: Brief, image: string | null) => void;
};

const field =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground";

export function BriefForm({ loading, onSubmit }: Props) {
  const [brief, setBrief] = useState<Brief>({
    company: "",
    industry: INDUSTRIES[0],
    description: "",
    audience: "",
    keywords: "",
    style: STYLES[0].value,
    colors: "",
  });
  const [image, setImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof Brief>(k: K, v: Brief[K]) {
    setBrief((b) => ({ ...b, [k]: v }));
  }

  function handleFile(file?: File) {
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  const valid = brief.company.trim().length > 1 && brief.description.trim().length > 3;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !loading) onSubmit(brief, image);
      }}
      className="studio-panel grid gap-6 p-6 md:grid-cols-[280px_1fr] md:p-8"
    >
      <div>
        <span className={label}>Logo atual (opcional)</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="checkerboard flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-border bg-background/40 p-4 text-center text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
        >
          {image ? (
            <img src={image} alt="Logo atual enviada" className="max-h-full max-w-full" />
          ) : (
            <span>
              Clique para enviar
              <br />
              <span className="text-xs">PNG, JPG ou SVG · até 6MB</span>
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {image && (
          <button
            type="button"
            onClick={() => setImage(null)}
            className="mt-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Remover imagem
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className={label} htmlFor="company">
            Nome da empresa
          </label>
          <input
            id="company"
            className={field}
            maxLength={60}
            value={brief.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Padaria Aurora"
          />
        </div>
        <div>
          <label className={label} htmlFor="industry">
            Setor
          </label>
          <select
            id="industry"
            className={field}
            value={brief.industry}
            onChange={(e) => set("industry", e.target.value)}
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="description">
            O que a empresa faz
          </label>
          <textarea
            id="description"
            className={`${field} min-h-20 resize-y`}
            maxLength={400}
            value={brief.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Padaria artesanal de bairro, fermentação natural, atendimento de balcão."
          />
        </div>
        <div>
          <label className={label} htmlFor="audience">
            Público-alvo
          </label>
          <input
            id="audience"
            className={field}
            maxLength={120}
            value={brief.audience}
            onChange={(e) => set("audience", e.target.value)}
            placeholder="Famílias do bairro, 25–55 anos"
          />
        </div>
        <div>
          <label className={label} htmlFor="keywords">
            3 palavras da marca
          </label>
          <input
            id="keywords"
            className={field}
            maxLength={80}
            value={brief.keywords}
            onChange={(e) => set("keywords", e.target.value)}
            placeholder="moderno, confiável, premium"
          />
        </div>
        <div className="sm:col-span-2">
          <span className={label}>Estilo preferido</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {STYLES.map((s) => {
              const active = brief.style === s.value;
              return (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => set("style", s.value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                    active
                      ? "border-primary bg-primary/10 text-foreground studio-glow"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <span className="block font-medium">{s.value}</span>
                  <span className="block text-[11px] opacity-70">{s.hint}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="colors">
            Cores (opcional)
          </label>
          <input
            id="colors"
            className={field}
            maxLength={120}
            value={brief.colors}
            onChange={(e) => set("colors", e.target.value)}
            placeholder="Deixe vazio para a IA sugerir"
          />
        </div>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!valid || loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Spinner />}
            {loading ? "Analisando marca e gerando propostas…" : "Gerar propostas"}
          </button>
          <span className="text-xs text-muted-foreground">
            6 propostas em poucos minutos · IA especializada em identidade visual
          </span>
        </div>
      </div>
    </form>
  );
}