"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
const ELIGIBILITY_RESULT_KEY = "medsim.eligibility.result";

type DiabetesAnswer = EligibilityDraft["hasDiabetes"];
type ApiStatus = "ELIGIBLE" | "NOT_ELIGIBLE" | "BORDERLINE";

export function EligibilityWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [notEligibleResult, setNotEligibleResult] = useState<EligibilityResult | null>(null);

  const [age, setAge] = useState(35);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(90);
  const [hasDiabetes, setHasDiabetes] = useState<DiabetesAnswer>("no");
  const [hasThyroidOrPancreatitis, setHasThyroidOrPancreatitis] = useState(false);
  const [isPregnantOrNursing, setIsPregnantOrNursing] = useState(false);

  const bmi = useMemo(() => computeBmi(weightKg, heightCm), [weightKg, heightCm]);

  async function finish() {
    setSubmitting(true);
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

    try {
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

      const payload = (await res.json().catch(() => null)) as {
        status?: ApiStatus;
        result?: EligibilityResult;
        error?: string;
      } | null;

      if (!res.ok || !payload?.status) {
        const local = evaluateEligibility(draft);
        if (local.outcome === "not_eligible") {
          sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, "NOT_ELIGIBLE");
          setNotEligibleResult(local);
          setSubmitting(false);
          return;
        }
        if (local.outcome === "eligible") {
          sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, "ELIGIBLE");
          router.push("/questionnaire");
          return;
        }
        sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, "BORDERLINE");
        sessionStorage.setItem("medsim.eligibility.borderline", "1");
        router.push("/questionnaire?borderline=1");
        return;
      }

      sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, payload.status);

      if (payload.status === "ELIGIBLE") {
        router.push("/questionnaire");
        return;
      }

      if (payload.status === "BORDERLINE") {
        sessionStorage.setItem("medsim.eligibility.borderline", "1");
        router.push("/questionnaire?borderline=1");
        return;
      }

      setNotEligibleResult(payload.result ?? evaluateEligibility(draft));
    } catch {
      const local = evaluateEligibility(draft);
      if (local.outcome === "not_eligible") {
        sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, "NOT_ELIGIBLE");
        setNotEligibleResult(local);
      } else if (local.outcome === "eligible") {
        sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, "ELIGIBLE");
        router.push("/questionnaire");
      } else {
        sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, "BORDERLINE");
        sessionStorage.setItem("medsim.eligibility.borderline", "1");
        router.push("/questionnaire?borderline=1");
      }
    } finally {
      setSubmitting(false);
    }
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

  if (notEligibleResult) {
    return (
      <div className={`${dsCard} mx-auto max-w-lg border-orange-100 bg-[#FFF7ED] text-center`}>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#EA580C]">
          Non admissible pour l&apos;instant
        </p>
        <h2 className="mt-3 text-2xl font-bold text-[#1A1A2E]">
          On comprend — ce n&apos;est pas un « non » définitif
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
          {notEligibleResult.message}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
          Votre santé passe avant tout. Si votre situation change, vous pourrez refaire le test.
          En attendant, le 811 et votre médecin de famille demeurent d&apos;excellentes ressources
          au Québec.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="https://www.quebec.ca/sante/trouver-une-ressource/info-sante-811"
            target="_blank"
            rel="noopener noreferrer"
            className={dsBtnPrimary}
          >
            Info-Santé 811
          </Link>
          <Link href="/" className={dsBtnSecondary}>
            Retour à l&apos;accueil
          </Link>
        </div>
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
