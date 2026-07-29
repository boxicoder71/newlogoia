import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { BriefForm } from "@/components/studio/BriefForm";
import { ProposalCard } from "@/components/studio/ProposalCard";
import { RefinePanel } from "@/components/studio/RefinePanel";
import { PaywallDialog } from "@/components/studio/PaywallDialog";
import { BeforeAfter } from "@/components/studio/BeforeAfter";
import { HowItWorks } from "@/components/studio/HowItWorks";
import { BeforeForm } from "@/components/studio/BeforeForm";
import { GenerationProgress } from "@/components/studio/GenerationProgress";
import type { Analysis, Brief, Proposal } from "@/components/studio/types";
import { generateLogo, purchaseAndFetchClean } from "@/lib/generateLogo";
import { PROPOSAL_COUNT } from "@/lib/logo-knowledge";
import { downloadPng, downloadSvg } from "@/lib/exportLogo";

const PRICE = "R$ 49,00";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rebrand IA — Redesign de logos profissional em minutos" },
      {
        name: "description",
        content:
          "Envie sua logo atual, receba um diagnóstico de design e 4 propostas de redesign geradas por IA, com refinamento por conversa e download em alta resolução.",
      },
      { property: "og:title", content: "Rebrand IA — Redesign de logos profissional em minutos" },
      {
        property: "og:description",
        content:
          "Envie sua logo atual, receba um diagnóstico de design e 4 propostas de redesign geradas por IA, com refinamento por conversa e download em alta resolução.",
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
  const [cleanByAsset, setCleanByAsset] = useState<Record<string, string>>({});
  const [paywallFormat, setPaywallFormat] = useState<"png" | "svg" | null>(null);
  const [paying, setPaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const selected = proposals.find((p) => p.id === selectedId) ?? null;
  const generating = proposals.some((p) => p.status === "pending" || p.status === "streaming");
  const doneCount = proposals.filter((p) => p.status === "done" || p.status === "error").length;
  const currentVersion = selected?.versions[selected.currentIndex] ?? null;
  const currentAssetId = currentVersion?.assetId ?? null;
  const paid = currentAssetId ? Boolean(cleanByAsset[currentAssetId]) : false;

  function patch(id: string, update: (p: Proposal) => Proposal) {
    setProposals((list) => list.map((p) => (p.id === id ? update(p) : p)));
  }

  function selectProposal(p: Proposal) {
    setSelectedId(p.id);
    if (!brief) return;
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "selection",
        industry: brief.industry,
        style: brief.style,
        archetype: p.archetype,
      }),
    }).catch(() => {});
  }

  function briefSummary(b: Brief) {
    return `${b.company}${b.slogan ? ` — slogan "${b.slogan}"` : ""} · ${b.industry} · ${b.description} · público: ${b.audience} · palavras: ${b.keywords} · estilo: ${b.style} · cores: ${b.colors || "livre"}${b.avoid ? ` · evitar: ${b.avoid}` : ""}${b.usage ? ` · uso: ${b.usage}` : ""}${b.references ? ` · referências de clima: ${b.references}` : ""}`;
  }

  async function runProposal(p: Proposal, b: Brief, ref: string | null) {
    patch(p.id, (x) => ({ ...x, status: "streaming" }));
    try {
      const { assetId, preview } = await generateLogo({
        prompt: p.prompt,
        refImage: ref,
        fast: true,
        expect: {
          company: b.company,
          slogan: b.slogan || null,
          briefSummary: briefSummary(b),
        },
        meta: {
          industry: b.industry,
          style: b.style,
          archetype: p.archetype,
          kind: "generation",
        },
      });
      patch(p.id, (x) => ({
        ...x,
        versions: [{ src: preview, label: "Proposta inicial", final: true, assetId }],
        currentIndex: 0,
      }));
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
    setTimeout(() => {
      progressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
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
      const list: Proposal[] = data.directions.slice(0, PROPOSAL_COUNT).map((d, i) => ({
        id: `p${i}-${Date.now()}`,
        name: d.name,
        rationale: d.rationale,
        prompt: d.prompt,
        archetype: d.archetype,
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
    // Todo o histórico da conversa vai junto: briefing + todos os ajustes já pedidos.
    const previous = selected.versions
      .slice(1, selected.currentIndex + 1)
      .map((v, i) => `${i + 1}. ${v.label}`)
      .join("\n");
    patch(id, (x) => ({
      ...x,
      versions: [...x.versions, { src: base.src, label: instruction, final: false }],
      currentIndex: newIndex,
      status: "streaming",
    }));
    const prompt = `Refine the attached logo. Do not start from scratch.

Original brief: ${briefSummary(brief)}
Creative direction of this proposal: ${selected.prompt}
${previous ? `Adjustments already applied (all of them must remain in effect):\n${previous}` : "No previous adjustments."}

New adjustment requested now: "${instruction}"

Apply the new adjustment on top of every previous decision — never undo an earlier request. Keep the exact text "${brief.company}"${brief.slogan ? ` and the tagline "${brief.slogan}"` : " with no extra words"} spelled correctly and legible, solid white background, flat vector logo shapes, legible at small size and functional in black and white.`;
    try {
      const { assetId, preview } = await generateLogo({
        prompt,
        refAssetId: base.assetId ?? null,
        fast: true,
        expect: {
          company: brief.company,
          slogan: brief.slogan || null,
          briefSummary: briefSummary(brief),
        },
        meta: {
          industry: brief.industry,
          style: brief.style,
          archetype: selected.archetype,
          kind: "refinement",
          detail: instruction,
        },
      });
      patch(id, (x) => {
        const versions = [...x.versions];
        versions[newIndex] = { src: preview, label: instruction, final: true, assetId };
        return { ...x, versions, currentIndex: newIndex };
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

  async function exportNow(format: "png" | "svg", cleanSrc: string) {
    if (!brief) return;
    const base = brief.company.toLowerCase().replace(/\s+/g, "-") || "marca";
    setExporting(true);
    try {
      if (format === "png") await downloadPng(cleanSrc, base);
      else await downloadSvg(cleanSrc, base);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao exportar arquivo");
    }
    setExporting(false);
  }

  function handleDownload(format: "png" | "svg") {
    if (!selected || !currentAssetId) return;
    const clean = cleanByAsset[currentAssetId];
    if (clean) {
      void exportNow(format, clean);
      return;
    }
    setPaywallFormat(format);
  }

  async function handlePay() {
    if (!selected || !paywallFormat || !currentAssetId) return;
    const assetId = currentAssetId;
    setPaying(true);
    setError(null);
    try {
      // O servidor cria o pedido, confirma o pagamento e só então libera o arquivo limpo.
      const clean = await purchaseAndFetchClean(assetId);
      setCleanByAsset((map) => ({ ...map, [assetId]: clean }));
      const format = paywallFormat;
      setPaywallFormat(null);
      setPaying(false);
      await exportNow(format, clean);
    } catch (e) {
      setPaying(false);
      setError(e instanceof Error ? e.message.slice(0, 200) : "Falha ao concluir o pagamento");
    }
  }

  function handleResetToOriginal() {
    if (!selected) return;
    patch(selected.id, (x) => ({ ...x, versions: x.versions.slice(0, 1), currentIndex: 0 }));
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

      <BeforeAfter />
      <HowItWorks />
      <BeforeForm />

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <BriefForm loading={analyzing || generating} onSubmit={handleBrief} />

        <div ref={progressRef}>
          <GenerationProgress
            active={analyzing || generating}
            analyzing={analyzing}
            done={doneCount}
            total={proposals.length || PROPOSAL_COUNT}
          />
        </div>

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
          <>
          <div className="mt-10 studio-panel p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Como escolher
            </p>
            <ol className="mt-2 grid gap-2 text-sm leading-relaxed text-muted-foreground sm:grid-cols-3">
              <li>
                <span className="font-medium text-foreground">1. Clique em uma proposta</span> para
                abri-la no painel de refinamento ao lado.
              </li>
              <li>
                <span className="font-medium text-foreground">2. Ajuste se quiser</span> — peça
                mudanças por escrito. Isso é opcional: se já gostou, pule esta etapa.
              </li>
              <li>
                <span className="font-medium text-foreground">3. Baixe em PNG e SVG</span> sem
                fundo. O download é liberado após o pagamento de {PRICE}.
              </li>
            </ol>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {proposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  selected={p.id === selectedId}
                  onSelect={() => selectProposal(p)}
                  onToggleFavorite={() => patch(p.id, (x) => ({ ...x, favorite: !x.favorite }))}
                />
              ))}
            </div>
            {selected && (
              <RefinePanel
                proposal={selected}
                refining={refining}
                paid={paid}
                cleanSrc={currentAssetId ? cleanByAsset[currentAssetId] : undefined}
                exporting={exporting}
                onRefine={handleRefine}
                onPickVersion={(i) => patch(selected.id, (x) => ({ ...x, currentIndex: i }))}
                onResetToOriginal={handleResetToOriginal}
                onDownload={handleDownload}
              />
            )}
          </div>
          </>
        )}
      </section>

      {selected && paywallFormat && (
        <PaywallDialog
          proposalName={selected.name}
          price={PRICE}
          processing={paying}
          onPay={handlePay}
          onClose={() => setPaywallFormat(null)}
        />
      )}

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Rebrand IA · Conteúdo gerado por inteligência artificial. Você é responsável por
            verificar a disponibilidade de registro da marca.
          </p>
          <nav className="flex gap-4">
            <Link to="/privacidade" className="underline underline-offset-4 hover:text-foreground">
              Política de privacidade
            </Link>
            <Link to="/termos" className="underline underline-offset-4 hover:text-foreground">
              Termos de uso
            </Link>
            <Link to="/contato" className="underline underline-offset-4 hover:text-foreground">
              Contato
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
