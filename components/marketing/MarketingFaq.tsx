"use client";

import { useId, useState } from "react";

const FAQ = [
  {
    q: "Suis-je éligible au traitement GLP-1 ?",
    a: "Généralement, un IMC ≥ 27 avec un facteur de risque (hypertension, diabète T2, etc.) ou IMC ≥ 30. Notre questionnaire d'éligibilité vous donne une indication en 2 minutes.",
  },
  {
    q: "Comment fonctionne Anne, le coach IA ?",
    a: "Anne est un assistant IA propulsé par Claude d'Anthropic, spécialement configuré pour le suivi GLP-1. Chaque lundi matin, elle analyse vos données de la semaine (poids, énergie, sommeil, effets secondaires) et vous envoie un message personnalisé. Elle alerte votre IPS si quelque chose sort de l'ordinaire. Anne ne remplace pas votre IPS — elle la rend 3× plus efficace.",
  },
  {
    q: "Est-ce que la RAMQ couvre le traitement ?",
    a: "Pour la perte de poids sans diabète de type 2 diagnostiqué, le traitement GLP-1 n'est pas couvert par la RAMQ. Certaines assurances collectives couvrent partiellement — vérifiez avec votre assureur. Nous fournissons des reçus pour soumission.",
  },
  {
    q: "Combien de temps avant de voir des résultats ?",
    a: "La plupart des patients voient une différence dès les semaines 4-6. La perte de poids moyenne est de 14,1 kg après 12 mois selon une étude PubMed 2025 sur 9 916 patients. Les résultats varient selon chaque personne.",
  },
  {
    q: "Quelle est la différence avec Felix Health ?",
    a: "Felix est une excellente plateforme, mais elle opère principalement en anglais et n'offre pas de suivi IA proactif. Anne-sante est 100 % québécois, en français authentique, et Anne vous contacte en premier chaque semaine — vous n'avez pas à demander de l'aide, on vient à vous.",
  },
  {
    q: "Est-ce que je peux parler à une vraie IPS ?",
    a: "Absolument. Le clavardage sécurisé avec votre IPS assignée est inclus dans votre abonnement. Elle répond généralement en moins de 24 h les jours ouvrables.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans frais et sans pénalité. Vous gérez votre abonnement directement depuis votre tableau de bord.",
  },
  {
    q: "Mes données médicales sont-elles sécurisées ?",
    a: "Vos données sont chiffrées AES-256, hébergées au Canada, et protégées selon la Loi 25 du Québec. Vous pouvez exporter ou supprimer toutes vos données à tout moment depuis votre profil.",
  },
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const panelId = useId();

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-6 text-left"
      >
        <span className="text-base font-semibold text-[#1A1A2E]">{q}</span>
        <span className="shrink-0 text-2xl font-light text-gray-400">{open ? "−" : "+"}</span>
      </button>
      <div
        id={panelId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-6 text-base leading-relaxed text-gray-500">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function MarketingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#FAFAF8] py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <h2 className="text-center text-4xl font-black tracking-tight text-[#1A1A2E]">
          Questions fréquentes
        </h2>

        <div className="mt-14 border-t border-gray-200">
          {FAQ.map((item, i) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
