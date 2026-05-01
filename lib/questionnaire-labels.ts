export type ObjectifPrincipal = "perte" | "glycemie" | "les_deux";

export function objectifLabel(o: string | ObjectifPrincipal | undefined): string {
  switch (o) {
    case "perte":
      return "Perdre du poids";
    case "glycemie":
      return "Contrôler ma glycémie";
    case "les_deux":
      return "Les deux";
    default:
      return "—";
  }
}
