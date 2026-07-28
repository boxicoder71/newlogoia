// Autoverificação: um modelo multimodal revisa a imagem antes de o usuário vê-la.

export type Expectation = {
  company: string;
  slogan?: string | null;
  briefSummary?: string | null;
};

export type Critique = {
  approved: boolean;
  spelledText: string;
  issues: string[];
  fixInstruction: string;
};

const SYSTEM = `Você é revisor de qualidade de logos. Recebe UMA imagem de logo e os dados esperados.
Sua tarefa é auditar o texto e a composição com rigor. Verifique:
1. O nome da empresa aparece escrito EXATAMENTE igual (letra por letra, incluindo acentuação e espaços).
2. Não há letras trocadas, faltando, duplicadas ou invertidas.
3. Não há palavras inventadas, texto duplicado ou rabiscos que imitam letras.
4. O texto é legível e bem construído.
5. O slogan, quando informado, está exatamente correto (se não houver slogan esperado, não pode existir texto extra).
6. A composição corresponde ao briefing e é uma logo vetorial plana em fundo branco.
Responda APENAS JSON válido:
{"approved":boolean,"spelledText":string,"issues":[string],"fixInstruction":string}
"spelledText" = transcrição literal de TODO o texto visível na imagem.
"fixInstruction" = instrução curta, em inglês, dizendo ao gerador exatamente o que corrigir (vazia se aprovado).
Seja rigoroso: qualquer diferença na grafia significa approved=false.`;

export async function critiqueLogo(
  base64Png: string,
  expect: Expectation,
  apiKey: string,
): Promise<Critique> {
  const expected = [
    `Nome exato esperado: "${expect.company}"`,
    expect.slogan ? `Slogan exato esperado: "${expect.slogan}"` : "Nenhum slogan esperado.",
    expect.briefSummary ? `Briefing: ${expect.briefSummary}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: expected },
            { type: "image_url", image_url: { url: `data:image/png;base64,${base64Png}` } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    console.error("[critique] falha ao revisar imagem:", res.status, await res.text().catch(() => ""));
    // Se o revisor falhar, não bloqueamos a entrega da imagem.
    return { approved: true, spelledText: "", issues: [], fixInstruction: "" };
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = (json.choices?.[0]?.message?.content ?? "")
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    const parsed = JSON.parse(raw) as Partial<Critique>;
    return {
      approved: Boolean(parsed.approved),
      spelledText: String(parsed.spelledText ?? ""),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 6).map(String) : [],
      fixInstruction: String(parsed.fixInstruction ?? ""),
    };
  } catch {
    return { approved: true, spelledText: "", issues: [], fixInstruction: "" };
  }
}

/** Monta o prompt da nova tentativa usando o feedback da revisão. */
export function retryPrompt(basePrompt: string, critique: Critique, company: string): string {
  const problems = critique.issues.length ? critique.issues.join("; ") : "misspelled brand name";
  return `${basePrompt}

CORRECTION PASS. The previous attempt was rejected by quality review.
Problems found: ${problems}.
Text that was actually rendered: "${critique.spelledText}".
${critique.fixInstruction}
Absolute priority: render the company name as the exact string "${company}", letter by letter, correct accents, no extra or missing characters, no duplicated words, clean legible letterforms.`;
}
