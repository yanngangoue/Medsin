type Props = {
  imc: number | null;
  suggestionText: string | null;
};

export function SuggestionSysteme({ imc, suggestionText }: Props) {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50/90 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-900">
        <span aria-hidden>⚠️</span>
        Suggestion système (non médicale)
      </p>
      {imc != null ? (
        <p className="mt-2 text-sm font-semibold text-amber-950">IMC : {imc.toFixed(1)}</p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
        {suggestionText ??
          "Aucune suggestion calculée. Votre évaluation clinique prime sur toute simulation."}
      </p>
      <p className="mt-3 text-xs text-amber-800/80">
        Cette suggestion est basée sur des critères déclaratifs et IMC uniquement. Elle ne constitue
        pas un avis médical. La décision finale vous appartient en tant que médecin.
      </p>
    </div>
  );
}
