const ITEMS = [
  "IPS certifiées Québec",
  "Livraison discrète",
  "Coach IA 24h/24",
  "Ordonnance en < 48 h",
  "Semaglutide générique disponible",
  "Sans médecin de famille requis",
  "Loi 25 — données protégées",
  "Annulable en tout temps",
];

function Track() {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center gap-8 whitespace-nowrap text-sm text-gray-500">
          {item}
          <span className="text-gray-300" aria-hidden>
            ·
          </span>
        </span>
      ))}
    </div>
  );
}

export function MarketingTrustBar() {
  return (
    <section className="overflow-hidden bg-[#F5F5F5] py-5" aria-label="Points de confiance">
      <div className="flex w-max animate-marquee">
        <Track />
        <Track />
      </div>
    </section>
  );
}
