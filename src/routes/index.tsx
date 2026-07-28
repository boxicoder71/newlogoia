import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BriefForm } from "@/components/studio/BriefForm";
import { ProposalCard } from "@/components/studio/ProposalCard";
import { RefinePanel } from "@/components/studio/RefinePanel";
import type { Analysis, Brief, Proposal } from "@/components/studio/types";
import { streamLogo } from "@/lib/streamImage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rebrand IA — Redesign de logos profissional em minutos" },
      {
        name: "description",
        content:
          "Envie sua logo atual, receba um diagnóstico de design e 6 propostas de redesign geradas por IA, com refinamento por conversa e download em alta resolução.",
      },
      { property: "og:title", content: "Rebrand IA — Redesign de logos em minutos" },
      {
        property: "og:description",
        content:
          "Diagnóstico da sua logo atual, 6 propostas de redesign com qualidade de agência e ajustes por conversa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = proposals.find((p) => p.id === selectedId) ?? null;

  function patch(id: string, update: (p: Proposal) => Proposal) {
    setProposals((list) => list.map((p) => (p.id === id ? update(p) : p)));
  }

  async function runProposal(p: Proposal, b: Brief, ref: string | null) {
    patch(p.id, (x) => ({ ...x, status: "streaming" }));
    try {
      await streamLogo({ prompt: p.prompt, refImage: ref }, (src, final) => {
        patch(p.id, (x) => {
          const versions = [...x.versions];
          versions[0] = { src, label: "Proposta inicial", final };
          return { ...x, versions, currentIndex: 0 };
        });
      });
      patch(p.id, (x) => ({ ...x, status: "done" }));
    } catch (e) {
      patch(p.id, (x) => ({
        ...x,
        status: "error",
        error: e instanceof Error ? e.message : "Falha na geração",
      }));
    }
    void b;
  }

  async function handleBrief(b: Brief, image: string | null) {
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProposals([]);
    setSelectedId(null);
    setBrief(b);
    setCurrentLogo(image);
    try {
      const res = await fetch("/api/analyze-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: b, image }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as Analysis;
      setAnalysis(data);
      const list: Proposal[] = data.directions.slice(0, 6).map((d, i) => ({
        id: `p${i}-${Date.now()}`,
        name: d.name,
        rationale: d.rationale,
        prompt: d.prompt,
        versions: [],
        currentIndex: 0,
        favorite: false,
        status: "pending",
      }));
      setProposals(list);
      setSelectedId(list[0]?.id ?? null);
      setAnalyzing(false);
      await Promise.all(list.map((p) => runProposal(p, b, image)));
    } catch (e) {
      setAnalyzing(false);
      setError(
        e instanceof Error && e.message
          ? e.message.slice(0, 200)
          : "Não conseguimos analisar o briefing agora.",
      );
    }
  }

  async function handleRefine(instruction: string) {
    if (!selected || !brief) return;
    const base = selected.versions[selected.currentIndex];
    if (!base) return;
    setRefining(true);
    const id = selected.id;
    const newIndex = selected.versions.length;
    patch(id, (x) => ({
      ...x,
      versions: [...x.versions, { src: base.src, label: instruction, final: false }],
      currentIndex: newIndex,
      status: "streaming",
    }));
    const prompt = `Edite a logo enviada aplicando este ajuste: "${instruction}".
Mantenha a identidade visual, o nome "${brief.company}" com ortografia correta e legível, fundo branco sólido, formas limpas de logo vetorial, legibilidade em tamanho pequeno e funcionamento em preto e branco. Não gere do zero: refine a imagem existente.`;
    try {
      await streamLogo({ prompt, refImage: base.src }, (src, final) => {
        patch(id, (x) => {
          const versions = [...x.versions];
          versions[newIndex] = { src, label: instruction, final };
          return { ...x, versions, currentIndex: newIndex };
        });
      });
      patch(id, (x) => ({ ...x, status: "done" }));
    } catch (e) {
      patch(id, (x) => ({
        ...x,
        versions: x.versions.slice(0, newIndex),
        currentIndex: Math.max(0, newIndex - 1),
        status: "done",
      }));
      setError(e instanceof Error ? e.message.slice(0, 200) : "Falha ao refinar");
    }
    setRefining(false);
  }

  function handleDownload() {
    const v = selected?.versions[selected.currentIndex];
    if (!v || !brief) return;
    const a = document.createElement("a");
    a.href = v.src;
    a.download = `${brief.company.toLowerCase().replace(/\s+/g, "-")}-logo.png`;
    a.click();
  }

  return (
    <main className="min-h-screen" style={{ backgroundImage: "var(--gradient-studio)" }}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-primary" />
          <span className="font-display text-base font-semibold tracking-tight">Rebrand IA</span>
        </div>
        <span className="text-xs text-muted-foreground">Estúdio de redesign de logos</span>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-10">
        <h1 className="max-w-3xl font-display text-4xl leading-[1.05] font-semibold sm:text-6xl">
          Sua logo nova, com qualidade de agência,{" "}
          <span className="text-primary">em minutos</span>.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Envie a logo atual da sua empresa e um briefing curto. A IA diagnostica o que não
          funciona, gera propostas de redesign e ajusta cada uma por conversa.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <BriefForm loading={analyzing} onSubmit={handleBrief} />

        {error && (
          <p className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        {analysis && (
          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="studio-panel p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Diagnóstico
              </p>
              <p className="mt-2 text-sm leading-relaxed">{analysis.diagnosis.summary}</p>
            </div>
            <div className="studio-panel p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Pontos fracos
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {analysis.diagnosis.weaknesses.map((w) => (
                  <li key={w}>— {w}</li>
                ))}
              </ul>
            </div>
            {currentLogo && (
              <div className="studio-panel checkerboard flex h-full min-h-32 w-full items-center justify-center p-4 md:w-40">
                <img src={currentLogo} alt="Logo atual da empresa" className="max-h-28" />
              </div>
            )}
          </div>
        )}

        {proposals.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {proposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  selected={p.id === selectedId}
                  onSelect={() => setSelectedId(p.id)}
                  onToggleFavorite={() => patch(p.id, (x) => ({ ...x, favorite: !x.favorite }))}
                />
              ))}
            </div>
            {selected && (
              <RefinePanel
                proposal={selected}
                refining={refining}
                onRefine={handleRefine}
                onPickVersion={(i) => patch(selected.id, (x) => ({ ...x, currentIndex: i }))}
                onDownload={handleDownload}
              />
            )}
          </div>
        )}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-8 text-xs text-muted-foreground">
          Rebrand IA · Conteúdo gerado por inteligência artificial. Você é responsável por
          verificar a disponibilidade de registro da marca.
        </div>
      </footer>
    </main>
  );
}
