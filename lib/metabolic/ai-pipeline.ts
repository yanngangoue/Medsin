/**
 * Analyse métabolique : appelle AIDecisionEngine si configuré, sinon heuristiques locales sécurisées (MVP).
 */
export type MetabolicAiResult = {
  nutritionalQuality: "low" | "moderate" | "high";
  habitLabels: string[];
  supplementGlpInteractionRisk: "none" | "low" | "moderate" | "high";
  lifestyleRhythmCoherence: "low" | "moderate" | "high";
  mealQualityScore?: number;
  recommendations?: string[];
};

function heuristic(input: { category: string; fhir: unknown }): MetabolicAiResult {
  const f = input.fhir as Record<string, unknown>;
  const resourceType = f?.resourceType as string | undefined;
  let mealQualityScore = 55;
  const habitLabels: string[] = [];

  if (resourceType === "NutritionIntake" && input.category === "MEAL") {
    const items = (f.consumedItem as unknown[])?.length ?? 0;
    mealQualityScore = Math.min(95, 40 + items * 8);
    habitLabels.push(items >= 2 ? "repas_multi_composantes" : "repas_simple");
  }
  if (input.category === "SUPPLEMENT") {
    habitLabels.push("complementation");
    const text = JSON.stringify(f).toLowerCase();
    const risk =
      /berbérine|berberine|gla|chromium|chrome|st john|millepertuis/i.test(text) ? "moderate" : "none";
    return {
      nutritionalQuality: "moderate",
      habitLabels,
      supplementGlpInteractionRisk: risk,
      lifestyleRhythmCoherence: "moderate",
      mealQualityScore,
      recommendations:
        risk !== "none"
          ? ["Vérifier interactions complément / GLP‑1 avec un professionnel.", "Ne pas arrêter un traitement sans avis médical."]
          : ["Maintenir une hydratation suffisante avec les repas."],
    };
  }
  if (input.category === "SLEEP") {
    habitLabels.push("suivi_sommeil");
    const v = f.valueQuantity as { value?: number } | undefined;
    const h = v?.value ?? 0;
    const coherence = h >= 7 && h <= 9 ? "high" : h >= 6 ? "moderate" : "low";
    return {
      nutritionalQuality: "moderate",
      habitLabels,
      supplementGlpInteractionRisk: "none",
      lifestyleRhythmCoherence: coherence,
      mealQualityScore,
      recommendations: coherence === "low" ? ["Cibler 7–9 h de sommeil pour la régulation métabolique."] : [],
    };
  }
  if (input.category === "ACTIVITY") {
    habitLabels.push("activite_physique");
    const v = f.valueQuantity as { value?: number } | undefined;
    const min = v?.value ?? 0;
    const coherence = min >= 150 ? "high" : min >= 60 ? "moderate" : "low";
    return {
      nutritionalQuality: "moderate",
      habitLabels,
      supplementGlpInteractionRisk: "none",
      lifestyleRhythmCoherence: coherence,
      mealQualityScore,
      recommendations: min < 60 ? ["Viser au moins 150 min/semaine d’activité modérée (repères génériques)."] : [],
    };
  }
  if (input.category === "MEDICATION_STATEMENT") {
    habitLabels.push("adherence_glp");
    return {
      nutritionalQuality: "high",
      habitLabels,
      supplementGlpInteractionRisk: "none",
      lifestyleRhythmCoherence: "high",
      mealQualityScore: 70,
      recommendations: [],
    };
  }

  return {
    nutritionalQuality: mealQualityScore >= 70 ? "high" : mealQualityScore >= 45 ? "moderate" : "low",
    habitLabels,
    supplementGlpInteractionRisk: "none",
    lifestyleRhythmCoherence: "moderate",
    mealQualityScore,
    recommendations: [],
  };
}

export async function analyzeMetabolicFhir(input: { category: string; fhir: unknown }): Promise<MetabolicAiResult> {
  const base = process.env.MEDSIM_AI_DECISION_ENGINE_URL?.replace(/\/$/, "");
  const token = process.env.MEDSIM_SERVICE_TOKEN;
  if (base) {
    try {
      const res = await fetch(`${base}/metabolic/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const json = (await res.json()) as MetabolicAiResult;
        if (json && typeof json === "object" && Array.isArray(json.habitLabels)) return json;
      }
    } catch {
      /* fallback */
    }
  }
  return heuristic(input);
}
