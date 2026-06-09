const STATS = [
  { value: "+12 000", label: "Patients accompagnés" },
  { value: "1–2 lbs", label: "Perte par semaine en moyenne" },
  { value: "98%", label: "Taux de satisfaction" },
  { value: "24 h", label: "Délai de réponse médecin" },
] as const;

export function StatsBar() {
  return (
    <section className="border-y border-[var(--border-soft)] bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
        {STATS.map(({ value, label }, i) => (
          <div
            key={label}
            className={`px-4 py-9 text-center md:py-11 ${i % 2 === 1 ? "border-l border-[var(--border-soft)]" : ""} ${
              i < 2 ? "border-b border-[var(--border-soft)] md:border-b-0" : ""
            } ${i > 0 ? "md:border-l md:border-[var(--border-soft)]" : ""}`}
          >
            <p className="text-[26px] font-bold tabular-nums text-[var(--teal)] md:text-[30px]">{value}</p>
            <p className="mt-1 text-[12px] leading-snug text-[var(--gray-muted)] md:text-[13px]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
