// Base de conhecimento de direção de arte: diretrizes por setor e
// arquétipos que garantem diversidade estrutural entre as propostas.

export type Archetype = {
  id: string;
  composition: string;
  mood: string;
  /** Instrução em inglês, injetada direto no prompt de imagem. */
  directive: string;
};

/** Quantidade de propostas geradas por briefing. */
export const PROPOSAL_COUNT = 4;

export const ALL_ARCHETYPES: Archetype[] = [
  {
    id: "symbol-wordmark",
    composition: "Símbolo + tipografia",
    mood: "Minimalista essencial",
    directive:
      "minimal combination mark: one extremely simple abstract symbol (buildable from 2-3 basic geometric shapes) placed to the left of the company name; two flat colours maximum, generous whitespace",
  },
  {
    id: "wordmark",
    composition: "Apenas tipografia",
    mood: "Tipográfico limpo",
    directive:
      "pure minimal wordmark, no icon at all: the company name only in a clean geometric sans-serif, wide even letter spacing, one subtle custom detail in a single letter; one or two flat colours",
  },
  {
    id: "monoline",
    composition: "Monoline",
    mood: "Traço único",
    directive:
      "monoline mark: a single continuous line of uniform stroke weight forming a simple symbol, with the company name in a light clean sans below; one colour plus a neutral, no fills",
  },
  {
    id: "monogram",
    composition: "Monograma",
    mood: "Geométrico",
    directive:
      "minimal monogram: the initials reduced to a strict geometric construction on an invisible grid (circles, squares, 45-degree angles only), full company name set small underneath; two flat colours",
  },
  {
    id: "negative-space",
    composition: "Espaço negativo",
    mood: "Recorte",
    directive:
      "negative-space mark: a simple solid shape where the brand idea is revealed by the empty space cut out of it, paired with a quiet sans wordmark; strictly two flat colours, no outlines",
  },
  {
    id: "monochrome-abstract",
    composition: "Ícone abstrato mono",
    mood: "Monocromático",
    directive:
      "monochrome abstract mark: one reduced conceptual geometric symbol in a single ink colour on white, with the company name in the same colour; no accent colour at all, maximum restraint",
  },
];

/** Arquétipos efetivamente usados na geração (diversidade estrutural). */
export const ARCHETYPES: Archetype[] = ALL_ARCHETYPES.slice(0, PROPOSAL_COUNT);

/** Traduz o estilo escolhido no formulário para instrução de imagem. */
export const STYLE_DIRECTIVES: Record<string, string> = {
  "Minimalista essencial": "strip everything non-essential; only the elements that carry meaning remain",
  "Geométrico minimalista": "build the mark on a strict grid from circles, squares and 45-degree angles",
  "Tipográfico limpo": "let typography carry the whole identity; symbol only if truly necessary",
  Monoline: "single uniform stroke weight, no fills, open and airy shapes",
  "Negativo / recorte": "use negative space as the main device; the empty area forms part of the meaning",
  Monocromático: "one single ink colour on white; contrast comes from shape, not from colour",
};

type Sector = { match: RegExp; guidance: string };

const SECTORS: Sector[] = [
  {
    match: /sa[úu]de|bem-estar|cl[íi]nic|m[ée]dic|odont|farm/i,
    guidance:
      "Healthcare: prefer blues and greens, calm and trustworthy; avoid intense reds and anything resembling blood or emergency signage; very clean shapes, plenty of whitespace, no crosses unless clearly abstract.",
  },
  {
    match: /tecnolog|software|ti\b|saas|digital|startup/i,
    guidance:
      "Technology: clean geometry, few details, precise construction; avoid clichés such as circuit boards, clouds, globes, gears, binary code, atoms or generic swooshes; modern, confident, scalable to a favicon.",
  },
  {
    match: /advoc|jur[íi]dic|direito|contab|financ|seguro/i,
    guidance:
      "Legal/finance: elegance above all, sophisticated typography (refined serif or high-contrast sans), tight kerning; avoid scales of justice, gavels, columns, shields and other literal legal symbols; restrained palette.",
  },
  {
    match: /aliment|bebida|restaurante|padaria|caf[ée]|food|gastron/i,
    guidance:
      "Food & drink: warmer, appetising colours (amber, terracotta, warm cream, deep green); welcoming and handcrafted feel; use an icon only when it genuinely adds meaning, never a generic fork-and-knife or chef hat.",
  },
  {
    match: /moda|vestu[áa]rio|beleza|est[ée]tica|joalher|cosm/i,
    guidance:
      "Fashion & beauty: refined typography, very few elements, generous whitespace, premium editorial feel; mostly monochrome with at most one accent; avoid decorative flourishes and script clichés.",
  },
  {
    match: /imobili|im[óo]vel|corretor|constru|engenharia|arquitet/i,
    guidance:
      "Real estate / construction: avoid generic house outlines and roof silhouettes; explore modern architectural concepts — structural lines, planes, negative space, elevation and grid geometry.",
  },
  {
    match: /educa|escola|curso|ensino/i,
    guidance:
      "Education: friendly but credible; avoid graduation caps, books and pencils as literal icons; prefer structured geometry with an optimistic accent colour.",
  },
  {
    match: /transporte|log[íi]stic|entrega|frete/i,
    guidance:
      "Transport & logistics: convey motion and reliability through directional geometry; avoid literal trucks, arrows-around-globe and speed lines; strong, compact mark that survives on a vehicle at distance.",
  },
  {
    match: /varejo|e-?commerce|loja|comercio|comércio/i,
    guidance:
      "Retail & e-commerce: memorable, friendly and highly legible at small sizes; avoid shopping carts and bag icons; the wordmark should carry most of the personality.",
  },
  {
    match: /consultoria|b2b|servi[çc]os/i,
    guidance:
      "B2B consulting: sober and structured, no playful mascots; a disciplined geometric mark plus a confident sans-serif wordmark.",
  },
];

const GENERIC =
  "Prioritise timeless simplicity: strong silhouette, no gradients, no 3D, no photorealism, no drop shadows, legible at 32px.";

/** Regras de minimalismo aplicadas a TODAS as gerações — é o foco do produto. */
export const MINIMALISM_RULES =
  "Design language: strict modern minimalism. Maximum simplicity — the fewest possible shapes, no ornament, no mascot, no illustration, no literal scene, no inner details, no outline strokes around the whole mark. At most two flat colours plus white. Wide clear space around the lockup. The mark must be reproducible as a single flat silhouette and still readable at 16px.";

export function sectorGuidance(industry: string): string {
  return SECTORS.find((s) => s.match.test(industry ?? ""))?.guidance ?? GENERIC;
}

/** Regras que sempre entram no prompt de imagem. */
export function baseImageRules(company: string, slogan?: string | null): string {
  return [
    `The exact text "${company}" must appear, spelled letter-by-letter exactly as written, including accents. Do not translate, abbreviate, pluralise or invent extra words.`,
    slogan
      ? `A secondary line with the exact tagline "${slogan}" in a smaller size, also spelled exactly.`
      : "Do not add any tagline, slogan or extra words.",
    "Flat vector logo, clean shapes, solid plain white background, centered composition with generous margin.",
    MINIMALISM_RULES,
    "No mockup, no photo, no realistic shadow, no gradient mesh, no 3D, no texture, no frame border.",
    "Must remain legible at favicon size and work in pure black and white.",
    "Never reproduce existing trademarks or copyrighted characters; the mark must be original.",
  ].join(" ");
}
