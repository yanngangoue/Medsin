import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";
import { latestMetabolicProfile, listMetabolicIntakes } from "@/lib/metabolic/repository";
import type { MetabolicAiResult } from "@/lib/metabolic/ai-pipeline";
import type { StoredIntake } from "@/lib/metabolic/repository";

function overallMetabolicScore(p: {
  nutritionalScore: number;
  metabolicStabilityScore: number;
  adherenceScore: number;
  lifestyleScore: number;
}): number {
  return Math.round(
    (p.nutritionalScore + p.metabolicStabilityScore + p.adherenceScore + p.lifestyleScore) / 4,
  );
}

export async function buildDoctorMetabolicDashboard(patientId: string) {
  const profile = !isDemoMode()
    ? await prisma.patientProfile.findUnique({ where: { userId: patientId } })
    : null;
  const weightKg = profile?.weightKg ?? null;
  const bmi = profile?.bmi ?? null;

  const glpIntakes = await listMetabolicIntakes(patientId, { categories: ["MEDICATION_STATEMENT"] });
  const lastGlp = glpIntakes[0];
  const fhirGlp = lastGlp?.fhirResource as {
    effectiveDateTime?: string;
    medicationCodeableConcept?: { text?: string };
  } | null;

  const adverse = await listMetabolicIntakes(patientId, { categories: ["ADVERSE_EFFECT"] });
  const adverseEffects = adverse.map((a) => {
    const o = a.fhirResource as { effectiveDateTime?: string; valueString?: string; code?: { text?: string } };
    return {
      date: o.effectiveDateTime ?? a.createdAt.toISOString(),
      text: o.valueString ?? o.code?.text ?? "effet_secondaire",
      severity: undefined as string | undefined,
    };
  });

  const snap = await latestMetabolicProfile(patientId);
  const glpCount = glpIntakes.length;
  const adherencePercent = glpCount > 0 ? Math.min(100, Math.round((glpCount / 12) * 100)) : null;

  const metabolicSection = snap
    ? {
        overallScore: overallMetabolicScore(snap),
        nutritionalScore: snap.nutritionalScore,
        stabilityScore: snap.metabolicStabilityScore,
        adherenceScore: snap.adherenceScore,
        lifestyleScore: snap.lifestyleScore,
        riskFlags: snap.riskFlags,
        fhirPanelObservation: snap.fhirPanelObservation,
        lastComputedAt: snap.computedAt.toISOString(),
      }
    : {
        overallScore: null,
        nutritionalScore: null,
        stabilityScore: null,
        adherenceScore: null,
        lifestyleScore: null,
        riskFlags: [] as string[],
        fhirPanelObservation: null,
        lastComputedAt: null,
      };

  return {
    patientId,
    clinical: {
      latestWeightKg: weightKg,
      latestBmi: bmi,
      glp1: {
        lastDoseDate: fhirGlp?.effectiveDateTime ?? null,
        adherencePercent,
        productLabel: fhirGlp?.medicationCodeableConcept?.text ?? null,
      },
      adverseEffects,
      treatmentAdherence: {
        score: snap?.adherenceScore ?? null,
        notes: glpCount
          ? glpCount + " declaration(s) de prise sur la periode consultee."
          : "Pas encore de donnees d'adherence.",
      },
    },
    metabolic: metabolicSection,
    generatedAt: new Date().toISOString(),
  };
}

function extractMacrosFromMeal(fhir: unknown) {
  const f = fhir as { consumedItem?: { extension?: { url: string; valueString?: string }[]; amount?: { value?: number; unit?: string } }[] };
  let protein = 0;
  let carb = 0;
  let fat = 0;
  let kcal = 0;
  for (const item of f.consumedItem ?? []) {
    for (const ex of item.extension ?? []) {
      if (ex.url.includes("macro-protein-g") && ex.valueString) protein += Number(ex.valueString) || 0;
      if (ex.url.includes("macro-carb-g") && ex.valueString) carb += Number(ex.valueString) || 0;
      if (ex.url.includes("macro-fat-g") && ex.valueString) fat += Number(ex.valueString) || 0;
    }
    if (item.amount?.unit === "kcal" && item.amount.value) kcal += item.amount.value;
  }
  return { kcal, protein, carb, fat };
}

function summarizePeriod(intakes: StoredIntake[], since: Date) {
  const slice = intakes.filter((i) => i.createdAt >= since);
  const meals = slice.filter((i) => i.category === "MEAL");
  let q = 0;
  let qn = 0;
  for (const m of meals) {
    const ai = m.aiAnalysis as MetabolicAiResult | null;
    if (ai?.mealQualityScore != null) {
      q += ai.mealQualityScore;
      qn++;
    }
  }
  const supplements = slice.filter((i) => i.category === "SUPPLEMENT").length;
  let protein = 0;
  let carb = 0;
  let fat = 0;
  let kcal = 0;
  for (const m of meals) {
    const mac = extractMacrosFromMeal(m.fhirResource);
    protein += mac.protein;
    carb += mac.carb;
    fat += mac.fat;
    kcal += mac.kcal;
  }
  return {
    meals: meals.length,
    supplements,
    avgQuality: qn ? q / qn : 0,
    macroTotals: { protein, carb, fat, kcal },
  };
}

export async function buildNutritionistMetabolicDashboard(patientId: string) {
  const all = await listMetabolicIntakes(patientId);
  const mealsRaw = all.filter((i) => i.category === "MEAL");
  const meals = mealsRaw.slice(0, 60).map((m) => {
    const f = m.fhirResource as { consumedItem?: { nutritionProduct?: { text?: string } }[] };
    const names = (f.consumedItem ?? []).map((c) => c.nutritionProduct?.text).filter(Boolean);
    const mac = extractMacrosFromMeal(m.fhirResource);
    const ai = m.aiAnalysis as MetabolicAiResult | null;
    return {
      id: m.id,
      date: m.createdAt.toISOString(),
      summary: names.join(", ") || "Repas",
      macros: { proteinG: mac.protein, carbG: mac.carb, fatG: mac.fat, kcal: mac.kcal },
      qualityScore: ai?.mealQualityScore ?? null,
    };
  });

  const supplements = all
    .filter((i) => i.category === "SUPPLEMENT")
    .slice(0, 40)
    .map((s) => {
      const f = s.fhirResource as { consumedItem?: { nutritionProduct?: { text?: string } }[] };
      const name = f.consumedItem?.[0]?.nutritionProduct?.text ?? "Complement";
      const ai = s.aiAnalysis as MetabolicAiResult | null;
      return {
        id: s.id,
        date: s.createdAt.toISOString(),
        productName: name,
        interactionRisk: ai?.supplementGlpInteractionRisk,
      };
    });

  const totals = meals.reduce(
    (acc, m) => {
      acc.p += m.macros.proteinG;
      acc.c += m.macros.carbG;
      acc.f += m.macros.fatG;
      return acc;
    },
    { p: 0, c: 0, f: 0 },
  );
  const sumMacro = totals.p + totals.c + totals.f;
  const macroDistribution =
    sumMacro > 0
      ? {
          proteinPct: Math.round((totals.p / sumMacro) * 100),
          carbPct: Math.round((totals.c / sumMacro) * 100),
          fatPct: Math.round((totals.f / sumMacro) * 100),
        }
      : { proteinPct: 0, carbPct: 0, fatPct: 0 };

  const qualities = meals.map((m) => m.qualityScore).filter((x): x is number => typeof x === "number");
  const dietaryQualityScore = qualities.length
    ? Math.round(qualities.reduce((a, b) => a + b, 0) / qualities.length)
    : null;

  const recImmediate: string[] = [];
  const recWeekly: string[] = [];
  const recMonthly: string[] = [];
  for (const m of mealsRaw.slice(0, 15)) {
    const ai = m.aiAnalysis as MetabolicAiResult | null;
    if (ai?.recommendations?.length) recImmediate.push(...ai.recommendations);
  }
  if (dietaryQualityScore != null && dietaryQualityScore < 50) {
    recWeekly.push("Augmenter la part de proteines au petit-dejeuner (repere general).");
  }

  const wkAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const moAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const weekly = summarizePeriod(all, wkAgo);
  const monthly = summarizePeriod(all, moAgo);
  if (monthly.meals < 5) recMonthly.push("Encourager la saisie reguliere de repas pour affiner l'analyse.");

  return {
    patientId,
    meals,
    supplements,
    macroDistribution,
    dietaryQualityScore,
    aiRecommendations: {
      immediate: [...new Set(recImmediate)].slice(0, 8),
      weekly: [...new Set(recWeekly)].slice(0, 6),
      monthly: [...new Set(recMonthly)].slice(0, 6),
    },
    summary: { weekly, monthly },
    generatedAt: new Date().toISOString(),
  };
}
