"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { computeBmi } from "@/lib/eligibility";
import {
  evaluateEligibility,
  type EligibilityResult,
} from "@/lib/onboarding/eligibility-result";
import {
  getOrCreateEligibilitySessionId,
  saveEligibilityDraft,
  type EligibilityDraft,
} from "@/lib/onboarding/eligibility-session";
import { dsBtnPrimary, dsBtnSecondary, dsCard } from "@/lib/design-system";

const TOTAL_STEPS = 5;

type DiabetesAnswer = EligibilityDraft["hasDiabetes"];

export function EligibilityWizard() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [age, setAge] = useState(35);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(90);
  const [hasDiabetes, setHasDiabetes] = useState<DiabetesAnswer>("no");
  const [hasThyroidOrPancreatitis, setHasThyroidOrPancreatitis] = useState(false);
  const [isPregnantOrNursing, setIsPregnantOrNursing] = useState(false);

  const bmi = useMemo(() => computeBmi(weightKg, heightCm), [weightKg, heightCm]);

  async function finish() {
    setSubmitting(true);
    setError(null);
    const draft: EligibilityDraft = {
      age,
      heightCm,
      weightKg,
      bmi,
      hasDiabetes,
      hasThyroidOrPancreatitis,
      isPregnantOrNursing,
    };
    saveEligibilityDraft(draft);

    const res = await fetch("/api/onboarding/eligibilite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getOrCreateEligibilitySessionId(),
        age,
        heightCm,
        weightKg,
        hasDiabetes,
        hasThyroidOrPancreatitis,
        isPregnantOrNursing,
      }),
    });

    if (!res.ok) {
      setError("Impossible d'enregistrer vos réponses. Réessayez.");
      setSubmitting(false);
      return;
    }

    const data = (await res.json()) as { result: EligibilityResult };
    setResult(data.result ?? evaluateEligibility(draft));
    setSubmitting(false);
  }

  function next() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    void finish();
  }

  function prev() {
    if (step > 1) setStep((s) => s - 1);
  }

  if (result) {
    const accent =
      result.outcome === "eligible"
        ? "text-[#10B981]"
        : result.outcome === "borderline"
          ? "text-[#F59E0B]"
          : "text-[#DC2626]";

    return (
      <div className={`${dsCard} mx-auto max-w-lg text-center`}>
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          {result.outcome === "eligible"
            ? "Admissible"
            : result.outcome === "borderline"
              ? "À évaluer"
              : "Non admissible"}
        </p>
        <h2 className="mt-3 text-2xl font-bold text-[#1A1A2E]">{result.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">{result.message}</p>
        {result.ctaHref && result.ctaLabel ? (
          <Link
            href={result.ctaHref}
            className={`mt-8 inline-flex h-14 items-center justify-center rounded-xl px-8 text-base font-semibold text-white shadow-sm ${
              result.outcome === "not_eligible"
                ? "bg-[#6B7280]"
                : "bg-[#3EBD93] hover:bg-[#35a882]"
            }`}
          >
            {result.ctaLabel}
          </Link>
        ) : (
          <Link href="/" className={`mt-8 ${dsBtnSecondary}`}>
            Retour à l&apos;accueil
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-[#6B7280]">
          <span>
            Étape {step} / {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)} %</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#3EBD93] transition-all duration-200 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className={dsCard}>
        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold text-[#1A1A2E]">Quel est votre âge ?</h2>
            <p className="mt-2 text-sm text-[#6B7280]">Le programme s&apos;adresse aux adultes (18 ans et +).</p>
            <label className="mt-6 block">
              <span className="text-3xl font-bold text-[#1D4D3A]">{age} ans</span>
              <input
                type="range"
                min={18}
                max={85}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="mt-4 w-full accent-[#1D4D3A]"
                aria-label="Âge"
              />
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="text-xl font-bold text-[#1A1A2E]">Quelle est votre taille et votre poids ?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Taille (cm)
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5"
                />
              </label>
              <label className="block text-sm">
                Poids (kg)
                <input
                  type="number"
                  min={30}
                  max={400}
                  step={0.1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5"
                />
              </label>
            </div>
            <div className="mt-6 rounded-xl bg-[#F0F7F4] p-4 text-sm">
              <p className="font-semibold text-[#1A1A2E]">IMC calculé : {bmi.toFixed(1)}</p>
              {bmi < 27 && bmi > 0 ? (
                <p className="mt-2 text-[#6B7280]">
                  Le traitement GLP-1 est généralement recommandé pour un IMC ≥ 27. Nous pouvons
                  quand même évaluer votre dossier.
                </p>
              ) : bmi >= 27 ? (
                <p className="mt-2 font-medium text-[#10B981]">✓ Seuil IMC habituel atteint</p>
              ) : null}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h2 className="text-xl font-bold text-[#1A1A2E]">
              Avez-vous un diagnostic de diabète de type 2 ?
            </h2>
            <div className="mt-6 flex flex-col gap-2">
              {(
                [
                  ["yes", "Oui"],
                  ["no", "Non"],
                  ["unknown", "Je ne sais pas"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHasDiabetes(value)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition duration-200 ${
                    hasDiabetes === value
                      ? "border-[#1D4D3A] bg-[#F0F7F4] text-[#1D4D3A]"
                      : "border-[#E5E7EB] bg-white text-[#1A1A2E] hover:border-[#3EBD93]/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h2 className="text-xl font-bold text-[#1A1A2E]">
              Avez-vous des antécédents de cancer de la thyroïde ou de pancréatite ?
            </h2>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setHasThyroidOrPancreatitis(true)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${
                  hasThyroidOrPancreatitis
                    ? "border-[#DC2626] bg-red-50 text-[#DC2626]"
                    : "border-[#E5E7EB]"
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => setHasThyroidOrPancreatitis(false)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${
                  !hasThyroidOrPancreatitis
                    ? "border-[#1D4D3A] bg-[#F0F7F4]"
                    : "border-[#E5E7EB]"
                }`}
              >
                Non
              </button>
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <h2 className="text-xl font-bold text-[#1A1A2E]">
              Êtes-vous enceinte ou allaitez-vous ?
            </h2>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsPregnantOrNursing(true)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${
                  isPregnantOrNursing
                    ? "border-[#DC2626] bg-red-50 text-[#DC2626]"
                    : "border-[#E5E7EB]"
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => setIsPregnantOrNursing(false)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${
                  !isPregnantOrNursing
                    ? "border-[#1D4D3A] bg-[#F0F7F4]"
                    : "border-[#E5E7EB]"
                }`}
              >
                Non
              </button>
            </div>
          </>
        ) : null}

        {error ? <p className="mt-4 text-sm text-[#DC2626]">{error}</p> : null}

        <div className="mt-8 flex justify-between gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1 || submitting}
            className={dsBtnSecondary}
          >
            Précédent
          </button>
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className={dsBtnPrimary}
          >
            {step === TOTAL_STEPS ? (submitting ? "Analyse…" : "Voir mon résultat") : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}
