import Link from "next/link";

const STEPS = [
  {
    time: "2 min",
    icon: "⏱️",
    title: "Vérifiez votre éligibilité",
    description: "5 questions simples. Aucun compte requis.",
  },
  {
    time: "5 min",
    icon: "📋",
    title: "Complétez votre dossier médical",
    description:
      "Questionnaire sécurisé. Vos données sont chiffrées et protégées (Loi 25).",
  },
  {
    time: "< 48 h",
    icon: "🩺",
    title: "Votre IPS évalue et prescrit",
    description:
      "Une vraie professionnelle certifiée au Québec révise votre dossier et rédige votre ordonnance.",
  },
  {
    time: "Livraison + suivi",
    icon: "📦",
    title: "Médicament livré · Anne prend le relais",
    description:
      "Livraison discrète chez vous. Anne commence votre suivi proactif dès la réception.",
  },
];

export function MarketingHowItWorks() {
  return (
    <section id="comment-ca-marche" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="text-center text-4xl font-black tracking-tight text-[#1A1A2E] md:text-5xl">
          De chez vous. En 4 étapes.
        </h2>

        <div className="relative mt-20">
          <div
            className="absolute left-[12.5%] right-[12.5%] top-12 hidden h-px border-t border-dashed border-gray-300 lg:block"
            aria-hidden
          />

          <ol className="grid gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative text-center">
                <div className="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-[#1D4D3A]/20 bg-white shadow-sm">
                  <span className="text-2xl" aria-hidden>
                    {step.icon}
                  </span>
                  <span className="mt-1 text-xs font-bold text-[#1D4D3A]">{step.time}</span>
                </div>
                <span className="mt-4 block text-xs font-bold text-gray-400">
                  Étape {index + 1}
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#1A1A2E]">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/eligibilite"
            className="inline-flex rounded-full bg-[#1D4D3A] px-10 py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Commencer mon évaluation →
          </Link>
        </div>
      </div>
    </section>
  );
}
