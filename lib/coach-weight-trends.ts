import type { WeightCheckInPublic } from "@/lib/patient/weight-program";

/** Tendance de poids sur les derniers check-ins (kg par rapport au précédent). */
export function tendancePoids(checkIns: WeightCheckInPublic[]): {
  deltaDernierKg: number | null;
  moyenneEnergie: number | null;
  moyenneSommeil: number | null;
  libelle: string;
} {
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  let deltaDernierKg: number | null = null;
  if (sorted.length >= 2) {
    const prev = sorted[sorted.length - 2]!;
    const last = sorted[sorted.length - 1]!;
    deltaDernierKg = Math.round((last.weight - prev.weight) * 10) / 10;
  }

  const avecEnergie = sorted.filter((c) => c.energie != null);
  const avecSommeil = sorted.filter((c) => c.sommeil != null);
  const moyenneEnergie =
    avecEnergie.length > 0
      ? Math.round(
          (avecEnergie.reduce((s, c) => s + (c.energie ?? 0), 0) / avecEnergie.length) * 10,
        ) / 10
      : null;
  const moyenneSommeil =
    avecSommeil.length > 0
      ? Math.round(
          (avecSommeil.reduce((s, c) => s + (c.sommeil ?? 0), 0) / avecSommeil.length) * 10,
        ) / 10
      : null;

  let libelle = "Pas assez de données pour une tendance.";
  if (deltaDernierKg != null) {
    if (deltaDernierKg < -0.1) {
      libelle = `Tendance à la baisse (${deltaDernierKg} kg depuis le dernier bilan hebdomadaire).`;
    } else if (deltaDernierKg > 0.1) {
      libelle = `Légère hausse (+${deltaDernierKg} kg depuis le dernier bilan hebdomadaire).`;
    } else {
      libelle = "Poids stable depuis le dernier bilan hebdomadaire.";
    }
  }

  return { deltaDernierKg, moyenneEnergie, moyenneSommeil, libelle };
}
