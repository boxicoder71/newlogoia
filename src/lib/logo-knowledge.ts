// Base de conhecimento de direção de arte: diretrizes por setor e
// arquétipos que garantem diversidade estrutural entre as 6 propostas.

export type Archetype = {
  id: string;
  composition: string;
  mood: string;
  /** Instrução em inglês, injetada direto no prompt de imagem. */
  directive: string;
};

export const ARCHETYPES: Archetype[] = [
  {
    id: "symbol-wordmark",
    composition: "Símbolo + tipografia",
    mood: "Alto contraste",
    directive:
      "combination mark: a distinctive abstract symbol placed above or to the left of the company name; high-contrast palette (one dark neutral plus one saturated accent)",
  },
  {
    id: "wordmark",
    composition: "Apenas tipografia",
    mood: "Minimalista",
    directive:
      "pure wordmark, no icon at all: the company name only, custom-feeling letterforms, generous letter spacing; minimalist palette, at most two flat colours",
  },
  {
    id: "emblem",
    composition: "Emblema",
    mood: "Premium",
    directive:
      "emblem/badge lockup: the company name enclosed inside a contained shape (circle, shield or rounded frame); premium palette (deep neutral plus a metallic-feeling warm or cool accent), refined and balanced",
  },
  {
    id: "monogram",
    composition: "Monograma",
    mood: "Paleta fria",
    directive:
      "monogram: the initials of the company interlocked into a single geometric mark, with the full company name set small underneath; cool palette (blues, teals, cool greys)",
  },
  {
    id: "lettermark",
    composition: "Lettermark",
    mood: "Paleta quente",
    directive:
      "lettermark: a single dominant initial letter treated as the icon, with the full company name in a small clean type line beside or below it; warm palette (amber, terracotta, warm reds or golden tones)",
  },
  {
    id: "abstract-icon",
    composition: "Ícone abstrato",
    mood: "Paleta neutra",
    directive:
      "abstract icon mark: a conceptual geometric symbol that suggests the brand idea without literal illustration, with the company name in a neutral sans type line; restrained neutral palette (greys, off-white, one muted tone)",
  },
];

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
    "No mockup, no photo, no realistic shadow, no gradient mesh, no 3D, no texture, no frame border.",
    "Must remain legible at favicon size and work in pure black and white.",
    "Never reproduce existing trademarks or copyrighted characters; the mark must be original.",
  ].join(" ");
}
