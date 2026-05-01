"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  questionnaireFormSchema,
  questionnaireFormToApiBody,
  type QuestionnaireFormValues,
} from "@/lib/schemas/questionnaire";
import { computeBmi } from "@/lib/eligibility";

const STEPS = 5;

const OBJECTIFS = [
  { value: "perte" as const, label: "Perdre du poids" },
  { value: "glycemie" as const, label: "Contrôler ma glycémie" },
  { value: "les_deux" as const, label: "Les deux" },
];

const ANTECEDENTS = [
  { id: "diabete_t2" as const, label: "Diabète type 2" },
  { id: "hypertension" as const, label: "Hypertension" },
  { id: "cardiovasculaire" as const, label: "Maladie cardiovasculaire" },
  { id: "rein" as const, label: "Problèmes rénaux" },
  { id: "aucun" as const, label: "Aucun de ces éléments" },
];

const emptyForm: QuestionnaireFormValues = {
  objectif: "perte",
  poidsKg: "",
  tailleCm: "",
  glp1Essaye: false,
  glp1Lequel: "",
  antecedents: [],
  medicaments: false,
  medicamentsLesquels: "",
};

export default function QuestionnairePage() {
  const router = useRouter();
  const { status } = useSession();
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(questionnaireFormSchema),
    mode: "onChange",
    defaultValues: emptyForm,
  });

  const { register, watch, setValue, handleSubmit, formState, trigger, reset, control } = form;
  const values = watch();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/connexion");
      return;
    }
    if (status === "authenticated") {
      reset(emptyForm);
      setMounted(true);
    }
  }, [status, reset, router]);

  const poidsNum = Number(values.poidsKg.replace(",", "."));
  const tailleNum = Number(values.tailleCm.replace(",", "."));
  const bmiPreview =
    values.poidsKg.trim() &&
    values.tailleCm.trim() &&
    Number.isFinite(poidsNum) &&
    Number.isFinite(tailleNum) &&
    poidsNum > 0 &&
    tailleNum > 0
      ? computeBmi(poidsNum, tailleNum)
      : null;

  function toggleAntecedent(id: (typeof ANTECEDENTS)[number]["id"]) {
    const cur = values.antecedents ?? [];
    if (id === "aucun") {
      setValue("antecedents", ["aucun"], { shouldValidate: true });
      return;
    }
    const withoutAucun = cur.filter((a) => a !== "aucun");
    const has = withoutAucun.includes(id);
    const next = has ? withoutAucun.filter((a) => a !== id) : [...withoutAucun, id];
    setValue("antecedents", next, { shouldValidate: true });
  }

  const fieldGroups: (keyof QuestionnaireFormValues)[][] = [
    ["objectif"],
    ["poidsKg", "tailleCm"],
    ["glp1Essaye", "glp1Lequel"],
    ["antecedents"],
    ["medicaments", "medicamentsLesquels"],
  ];

  async function goNext() {
    const ok = await trigger(fieldGroups[step]);
    if (!ok) return;
    if (step < STEPS - 1) setStep((s) => s + 1);
  }

  function goPrev() {
    setStep((s) => Math.max(0, s - 1));
  }

  const onFinish = handleSubmit(async (data) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionnaireFormToApiBody(data)),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setSubmitError(body?.error ?? "Enregistrement impossible.");
        return;
      }
      router.push("/onboarding/confirmation");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  });

  if (status === "loading" || !mounted) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 items-center justify-center py-16">
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    );
  }

  return (
    <form
      className="mx-auto flex w-full max-w-lg flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (step === STEPS - 1) void onFinish();
      }}
    >
      <h1 className="text-center text-2xl font-semibold text-slate-900">Questionnaire médical</h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        Répondez aux questions pour compléter votre dossier.
      </p>

      <div className="mx-auto mt-8 w-full max-w-lg overflow-hidden">
        <div
          className="flex w-[500%] transition-transform duration-[250ms] ease-out"
          style={{ transform: `translateX(-${(step * 100) / STEPS}%)` }}
        >
          <section className="w-1/5 shrink-0 px-1">
            <p className="mb-4 text-sm font-medium text-slate-800">Quel est votre objectif principal ?</p>
            <div className="flex flex-col gap-3">
              {OBJECTIFS.map((o) => (
                <label
                  key={o.value}
                  className={`flex cursor-pointer rounded-2xl border-2 p-4 transition ${
                    values.objectif === o.value
                      ? "border-[#1D9E75] bg-teal-50/60"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input type="radio" value={o.value} className="sr-only" {...register("objectif")} />
                  <span className="text-sm font-medium text-slate-900">{o.label}</span>
                </label>
              ))}
            </div>
            {formState.errors.objectif ? (
              <p className="mt-2 text-[12px] text-red-600/90">{formState.errors.objectif.message}</p>
            ) : null}
          </section>

          <section className="w-1/5 shrink-0 px-1">
            <p className="mb-4 text-sm font-medium text-slate-800">Votre poids et taille actuels</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="poids" className="mb-1 block text-xs font-medium text-slate-600">
                  Poids (kg)
                </label>
                <input
                  id="poids"
                  type="text"
                  inputMode="decimal"
                  className="h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  {...register("poidsKg")}
                />
                {formState.errors.poidsKg ? (
                  <p className="mt-1 text-[12px] text-red-600/90">{formState.errors.poidsKg.message}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="taille" className="mb-1 block text-xs font-medium text-slate-600">
                  Taille (cm)
                </label>
                <input
                  id="taille"
                  type="text"
                  inputMode="numeric"
                  className="h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  {...register("tailleCm")}
                />
                {formState.errors.tailleCm ? (
                  <p className="mt-1 text-[12px] text-red-600/90">{formState.errors.tailleCm.message}</p>
                ) : null}
              </div>
            </div>
            {bmiPreview != null ? (
              <p className="mt-3 text-sm text-[#1D9E75]">
                IMC estimé : <span className="font-semibold">{bmiPreview}</span>
              </p>
            ) : null}
          </section>

          <section className="w-1/5 shrink-0 px-1">
            <p className="mb-4 text-sm font-medium text-slate-800">
              Avez-vous déjà essayé un traitement GLP-1 ?
            </p>
            <Controller
              name="glp1Essaye"
              control={control}
              render={({ field }) => (
                <div className="flex gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span className="text-sm">Oui</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    <span className="text-sm">Non</span>
                  </label>
                </div>
              )}
            />
            {values.glp1Essaye ? (
              <div className="mt-4">
                <label htmlFor="glp1Lequel" className="mb-1 block text-xs font-medium text-slate-600">
                  Lequel ?
                </label>
                <input
                  id="glp1Lequel"
                  className="h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  {...register("glp1Lequel")}
                />
                {formState.errors.glp1Lequel ? (
                  <p className="mt-1 text-[12px] text-red-600/90">{formState.errors.glp1Lequel.message}</p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="w-1/5 shrink-0 px-1">
            <p className="mb-4 text-sm font-medium text-slate-800">
              Antécédents médicaux (sélectionnez tout ce qui s’applique)
            </p>
            <div className="flex flex-col gap-2">
              {ANTECEDENTS.map((a) => {
                const checked = (values.antecedents ?? []).includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAntecedent(a.id)}
                    className={`rounded-2xl border-2 p-3 text-left text-sm font-medium transition ${
                      checked ? "border-[#1D9E75] bg-teal-50/60 text-slate-900" : "border-slate-200 text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
            {formState.errors.antecedents ? (
              <p className="mt-2 text-[12px] text-red-600/90">{formState.errors.antecedents.message}</p>
            ) : null}
          </section>

          <section className="w-1/5 shrink-0 px-1">
            <p className="mb-4 text-sm font-medium text-slate-800">Prenez-vous des médicaments actuellement ?</p>
            <Controller
              name="medicaments"
              control={control}
              render={({ field }) => (
                <div className="flex gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span className="text-sm">Oui</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    <span className="text-sm">Non</span>
                  </label>
                </div>
              )}
            />
            {values.medicaments ? (
              <div className="mt-4">
                <label htmlFor="meds" className="mb-1 block text-xs font-medium text-slate-600">
                  Lesquels ?
                </label>
                <textarea
                  id="meds"
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  {...register("medicamentsLesquels")}
                />
                {formState.errors.medicamentsLesquels ? (
                  <p className="mt-1 text-[12px] text-red-600/90">{formState.errors.medicamentsLesquels.message}</p>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {submitError ? <p className="mt-4 text-center text-[12px] text-red-600/90">{submitError}</p> : null}

      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition ${i === step ? "bg-[#1D9E75]" : "bg-slate-300"}`}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0}
          className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40"
        >
          Précédent
        </button>
        {step === STEPS - 1 ? (
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-xl bg-[#1D9E75] px-6 text-sm font-medium text-white hover:bg-[#188763] disabled:opacity-50"
          >
            {isSubmitting ? "Envoi…" : "Terminer"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void goNext()}
            className="h-12 rounded-xl bg-[#1D9E75] px-6 text-sm font-medium text-white hover:bg-[#188763]"
          >
            Suivant
          </button>
        )}
      </div>
    </form>
  );
}
