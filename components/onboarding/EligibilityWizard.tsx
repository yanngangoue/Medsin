"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { computeBmi } from "@/lib/eligibility";
import { evaluateEligibility } from "@/lib/onboarding/eligibility-result";
import {
  ELIGIBILITY_RESULT_KEY,
  getOrCreateEligibilitySessionId,
  saveEligibilityDraft,
  type EligibilityDraft,
} from "@/lib/onboarding/eligibility-session";

type DiabetesAnswer = EligibilityDraft["hasDiabetes"];
type ApiStatus = "ELIGIBLE" | "NOT_ELIGIBLE" | "BORDERLINE";
type Dir = "forward" | "backward";

/* ── IMC gauge ──────────────────────────────────────────────── */
function BmiGauge({ bmi }: { bmi: number }) {
  const zones = [
    { label: "Insuffisant", max: 18.5, color: "#3B82F6" },
    { label: "Normal", max: 25, color: "#10B981" },
    { label: "Surpoids", max: 30, color: "#F59E0B" },
    { label: "Obésité", max: 40, color: "#EF4444" },
    { label: "Obésité sévère", max: 60, color: "#991B1B" },
  ];
  const pct = Math.min(100, Math.max(0, ((bmi - 10) / 50) * 100));
  const zone = zones.find((z) => bmi < z.max) ?? zones[zones.length - 1];
  const eligible = bmi >= 27;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Votre IMC</p>
          <p className="font-display text-4xl font-bold tracking-tight" style={{ color: zone.color }}>
            {bmi > 0 ? bmi.toFixed(1) : "—"}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${eligible ? "bg-[#F0F7F4] text-[#1D4D3A]" : "bg-slate-100 text-slate-600"}`}>
          {eligible ? "✓ Seuil GLP-1 atteint" : zone.label}
        </span>
      </div>
      {/* Barre gradient */}
      <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-600">
        <div
          className="absolute top-0 h-full w-1 -translate-x-1/2 rounded-full bg-white shadow-md transition-all duration-500"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
        <span>18.5</span><span>25</span><span>30</span><span>40+</span>
      </div>
    </div>
  );
}

/* ── Slide question ─────────────────────────────────────────── */
function Slide({ label, hint, children, dir }: { label: string; hint?: string; children: React.ReactNode; dir: Dir }) {
  const cls = dir === "forward" ? "q-enter-forward" : "q-enter-backward";
  return (
    <div className={cls}>
      <h2 className="font-display text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">{label}</h2>
      {hint && <p className="mt-2 text-base text-slate-500">{hint}</p>}
      <div className="mt-7">{children}</div>
    </div>
  );
}

/* ── Bouton choix ───────────────────────────────────────────── */
function ChoiceBtn({ active, onClick, children, danger }: { active: boolean; onClick(): void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left font-semibold transition-all duration-150 ${
        active
          ? danger
            ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
            : "border-[#1D4D3A] bg-[#F0F7F4] text-[#1D4D3A] shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? (danger ? "border-red-500 bg-red-500" : "border-[#1D4D3A] bg-[#1D4D3A]") : "border-slate-300"}`}>
        {active && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      {children}
    </button>
  );
}

/* ── Wizard principal ───────────────────────────────────────── */
export function EligibilityWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<Dir>("forward");
  const [submitting, setSubmitting] = useState(false);
  const [age, setAge] = useState(35);
  const [heightCm, setHeightCm] = useState<number | "">(170);
  const [weightKg, setWeightKg] = useState<number | "">(85);
  const [hasDiabetes, setHasDiabetes] = useState<DiabetesAnswer>("no");
  const [hasThyroidOrPancreatitis, setHasThyroidOrPancreatitis] = useState<boolean | null>(null);
  const [isPregnantOrNursing, setIsPregnantOrNursing] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bmi = useMemo(
    () => (heightCm && weightKg ? computeBmi(Number(weightKg), Number(heightCm)) : 0),
    [weightKg, heightCm],
  );

  const TOTAL = 5;
  const pct = Math.round(((step + 1) / TOTAL) * 100);

  const canContinue = useMemo(() => {
    if (step === 0) return age >= 18 && age <= 85;
    if (step === 1) return Number(heightCm) >= 100 && Number(weightKg) >= 30;
    if (step === 2) return hasDiabetes !== undefined;
    if (step === 3) return hasThyroidOrPancreatitis !== null;
    if (step === 4) return isPregnantOrNursing !== null;
    return false;
  }, [step, age, heightCm, weightKg, hasDiabetes, hasThyroidOrPancreatitis, isPregnantOrNursing]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function goNext() {
    if (!canContinue) return;
    if (step < TOTAL - 1) { setDir("forward"); setStep((s) => s + 1); return; }
    void finish();
  }

  function goPrev() {
    if (step === 0) return;
    setDir("backward");
    setStep((s) => s - 1);
  }

  async function finish() {
    setSubmitting(true);
    const draft: EligibilityDraft = {
      age,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      bmi,
      hasDiabetes,
      hasThyroidOrPancreatitis: hasThyroidOrPancreatitis ?? false,
      isPregnantOrNursing: isPregnantOrNursing ?? false,
    };
    saveEligibilityDraft(draft);

    const push = (status: ApiStatus) => {
      sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, status);
      if (status === "BORDERLINE") sessionStorage.setItem("medsim.eligibility.borderline", "1");
      router.push(`/eligibilite/resultat?status=${status}`);
    };

    try {
      const res = await fetch("/api/onboarding/eligibilite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getOrCreateEligibilitySessionId(), age, heightCm, weightKg, hasDiabetes, hasThyroidOrPancreatitis, isPregnantOrNursing }),
      });
      const payload = await res.json().catch(() => null) as { status?: ApiStatus } | null;
      if (res.ok && payload?.status) { push(payload.status); return; }
    } catch { /* fallback local */ }

    const local = evaluateEligibility(draft);
    push(local.outcome === "eligible" ? "ELIGIBLE" : local.outcome === "borderline" ? "BORDERLINE" : "NOT_ELIGIBLE");
    setSubmitting(false);
  }

  const stepLabels = ["Votre âge", "Taille & poids", "Diabète", "Antécédents", "Grossesse"];

  return (
    <div ref={containerRef} className="flex min-h-[70vh] flex-col">
      {/* Header progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="text-[#1D4D3A]">{stepLabels[step]}</span>
          <span className="font-bold text-slate-700">{pct} %</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-[#3EBD93] to-[#1D4D3A] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex gap-1">
          {stepLabels.map((l, i) => (
            <div key={l} title={l} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < step ? "bg-[#1D4D3A]" : i === step ? "bg-[#3EBD93]" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>

      {/* Contenu question */}
      <div className="flex-1 overflow-hidden">
        {step === 0 && (
          <Slide dir={dir} label="Quel est votre âge ?" hint="Le programme GLP-1 s'adresse aux adultes de 18 ans et plus.">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="mb-6 text-center">
                <span className="font-display text-6xl font-bold text-[#1D4D3A]">{age}</span>
                <span className="text-2xl font-medium text-slate-400"> ans</span>
              </div>
              <input type="range" min={18} max={85} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full cursor-pointer accent-[#1D4D3A]" />
              <div className="mt-2 flex justify-between text-xs text-slate-400"><span>18 ans</span><span>85 ans</span></div>
            </div>
          </Slide>
        )}

        {step === 1 && (
          <Slide dir={dir} label="Quelle est votre taille et votre poids ?" hint="Ces mesures permettent de calculer votre IMC.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Taille</label>
                <div className="relative">
                  <input type="number" min={100} max={250} value={heightCm} onChange={(e) => setHeightCm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 pr-12 text-lg font-bold text-slate-900 outline-none transition focus:border-[#3EBD93] focus:ring-4 focus:ring-[#3EBD93]/10" placeholder="170" />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">cm</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Poids actuel</label>
                <div className="relative">
                  <input type="number" min={30} max={400} step={0.1} value={weightKg} onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 pr-12 text-lg font-bold text-slate-900 outline-none transition focus:border-[#3EBD93] focus:ring-4 focus:ring-[#3EBD93]/10" placeholder="85" />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">kg</span>
                </div>
              </div>
            </div>
            {bmi > 0 && <BmiGauge bmi={bmi} />}
          </Slide>
        )}

        {step === 2 && (
          <Slide dir={dir} label="Avez-vous un diagnostic de diabète de type 2 ?" hint="Le GLP-1 est souvent prescrit pour le diabète de type 2 avec surpoids.">
            <div className="space-y-3">
              {([["yes", "Oui, j'ai un diagnostic de diabète de type 2"], ["no", "Non, pas de diabète connu"], ["unknown", "Je ne suis pas certain·e"]] as const).map(([v, l]) => (
                <ChoiceBtn key={v} active={hasDiabetes === v} onClick={() => setHasDiabetes(v)}>{l}</ChoiceBtn>
              ))}
            </div>
          </Slide>
        )}

        {step === 3 && (
          <Slide dir={dir} label="Avez-vous des antécédents de cancer de la thyroïde ou de pancréatite ?" hint="Ces conditions peuvent contre-indiquer certains traitements GLP-1.">
            <div className="space-y-3">
              <ChoiceBtn active={hasThyroidOrPancreatitis === true} danger onClick={() => setHasThyroidOrPancreatitis(true)}>
                Oui, j&apos;ai ces antécédents
              </ChoiceBtn>
              <ChoiceBtn active={hasThyroidOrPancreatitis === false} onClick={() => setHasThyroidOrPancreatitis(false)}>
                Non, aucun de ces antécédents
              </ChoiceBtn>
            </div>
          </Slide>
        )}

        {step === 4 && (
          <Slide dir={dir} label="Êtes-vous enceinte ou allaitez-vous actuellement ?" hint="Le GLP-1 est contre-indiqué pendant la grossesse et l'allaitement.">
            <div className="space-y-3">
              <ChoiceBtn active={isPregnantOrNursing === true} danger onClick={() => setIsPregnantOrNursing(true)}>
                Oui, je suis enceinte ou j&apos;allaite
              </ChoiceBtn>
              <ChoiceBtn active={isPregnantOrNursing === false} onClick={() => setIsPregnantOrNursing(false)}>
                Non
              </ChoiceBtn>
            </div>
          </Slide>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canContinue || submitting}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Analyse en cours…</>
          ) : step < TOTAL - 1 ? (
            <>Continuer <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></>
          ) : (
            <>Voir mon résultat <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></>
          )}
        </button>
      </div>
    </div>
  );
}
