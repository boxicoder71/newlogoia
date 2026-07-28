export type Brief = {
  company: string;
  /** Slogan opcional que deve aparecer na logo, escrito exatamente assim. */
  slogan: string;
  industry: string;
  description: string;
  audience: string;
  keywords: string;
  style: string;
  colors: string;
  /** O que a marca NÃO quer ver na logo. */
  avoid: string;
};

export type Analysis = {
  diagnosis: { summary: string; weaknesses: string[]; keep: string[] };
  directions: { name: string; rationale: string; prompt: string; archetype?: string }[];
};

export type Version = { src: string; label: string; final: boolean; assetId?: string };

export type Proposal = {
  id: string;
  name: string;
  rationale: string;
  prompt: string;
  archetype?: string;
  versions: Version[];
  currentIndex: number;
  favorite: boolean;
  status: "pending" | "streaming" | "done" | "error";
  error?: string;
};

export const INDUSTRIES = [
  "Alimentação e bebidas",
  "Beleza e estética",
  "Construção e engenharia",
  "Consultoria e serviços B2B",
  "Educação",
  "Moda e vestuário",
  "Saúde e bem-estar",
  "Tecnologia e software",
  "Transporte e logística",
  "Varejo e e-commerce",
  "Outro",
];

export const AI_SUGGESTED_STYLE = "Deixar a IA sugerir";

export const STYLES = [
  { value: "Minimalista", hint: "Formas simples, muito respiro" },
  { value: "Geométrico", hint: "Construção precisa, grid" },
  { value: "Mascote", hint: "Personagem memorável" },
  { value: "Tipográfico", hint: "Só letras, wordmark" },
  { value: "Emblema / badge", hint: "Selo, contorno fechado" },
  { value: "Abstrato", hint: "Símbolo conceitual" },
];