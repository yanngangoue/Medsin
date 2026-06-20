import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide nutritionnel GLP-1 — Anne-sante",
  description: "Guide nutritionnel gratuit pour les patients sous traitement GLP-1 : aliments recommandés, plans de repas, hydratation et conseils pratiques.",
};

/* ── Types & données ─────────────────────────────────────────── */
type Food = { name: string; why: string };
type Section = { category: string; icon: string; items: Food[] };

const FOODS_RECOMMENDED: Section[] = [
  {
    category: "Protéines maigres",
    icon: "🥩",
    items: [
      { name: "Poulet / dinde (sans peau)", why: "Satiété durable, faible en gras saturés" },
      { name: "Poisson et fruits de mer", why: "Oméga-3, protéines complètes" },
      { name: "Œufs", why: "Protéines hautement biodisponibles" },
      { name: "Légumineuses (lentilles, pois chiches)", why: "Fibres + protéines végétales" },
      { name: "Tofu / tempeh", why: "Alternative végétale complète" },
    ],
  },
  {
    category: "Légumes & fibres",
    icon: "🥦",
    items: [
      { name: "Légumes verts feuillus (épinards, kale)", why: "Denses en micronutriments, volume sans calories" },
      { name: "Brocoli, chou-fleur, zucchini", why: "Fibres solubles, IG bas" },
      { name: "Poivrons, concombre, tomates", why: "Hydratants et antioxydants" },
      { name: "Champignons", why: "Savoureux et très peu caloriques" },
    ],
  },
  {
    category: "Grains entiers",
    icon: "🌾",
    items: [
      { name: "Quinoa", why: "Protéines complètes + fibres" },
      { name: "Avoine (flocons entiers)", why: "Bêta-glucanes pour la satiété" },
      { name: "Riz brun / basmati", why: "IG plus bas que le riz blanc" },
      { name: "Pain de grains entiers (100 %)", why: "Fibres, vitamines B" },
    ],
  },
  {
    category: "Bons gras",
    icon: "🥑",
    items: [
      { name: "Avocat", why: "Gras mono-insaturés, potassium" },
      { name: "Huile d'olive extra-vierge", why: "Anti-inflammatoire, cœur sain" },
      { name: "Noix et amandes (petite quantité)", why: "Satiété, oméga-3" },
    ],
  },
];

const FOODS_AVOID: { name: string; reason: string }[] = [
  { name: "Aliments ultra-transformés", reason: "Favorisent les nausées et ralentissent la perte de poids" },
  { name: "Boissons sucrées (sodas, jus)", reason: "Calories vides, pics glycémiques" },
  { name: "Alcool", reason: "Amplifie les effets secondaires GLP-1 (nausées), calories vides" },
  { name: "Aliments très gras / frits", reason: "Ralentissent la vidange gastrique → inconfort" },
  { name: "Grandes portions à la fois", reason: "Estomac plus lent sous GLP-1 — fractionner les repas" },
  { name: "Caféine excessive (> 2 cafés/j)", reason: "Déshydratation, accentue les nausées" },
];

const MEAL_PLAN = [
  {
    day: "Exemple Jour 1",
    meals: [
      { time: "Déjeuner", meal: "Œufs brouillés (2) + épinards sautés + 1 tranche pain grains entiers" },
      { time: "Collation", meal: "Yogourt grec nature 2 % + quelques amandes" },
      { time: "Dîner", meal: "Salade de quinoa, poulet grillé, poivrons, vinaigrette citron-olive" },
      { time: "Souper", meal: "Filet de saumon au four + brocoli vapeur + riz brun (½ tasse)" },
    ],
  },
  {
    day: "Exemple Jour 2",
    meals: [
      { time: "Déjeuner", meal: "Flocons d'avoine + baies + 1 c. à soupe de graines de chia" },
      { time: "Collation", meal: "Tranches de concombre + hummus" },
      { time: "Dîner", meal: "Soupe de lentilles + salade verte + pain grains entiers" },
      { time: "Souper", meal: "Poitrine de dinde + courgettes grillées + quinoa" },
    ],
  },
  {
    day: "Exemple Jour 3",
    meals: [
      { time: "Déjeuner", meal: "Smoothie protéiné (épinards, banane, protéine de whey, lait d'amande)" },
      { time: "Collation", meal: "1 pomme + 1 c. à soupe beurre d'amande naturel" },
      { time: "Dîner", meal: "Bowl de tofu grillé + edamame + légumes rôtis + sauce tamari légère" },
      { time: "Souper", meal: "Crevettes sautées ail-citron + asperges + patate douce" },
    ],
  },
];

const TIPS = [
  { title: "Fractionner les repas", body: "Visez 4 à 5 petits repas plutôt que 3 gros. L'estomac se vide plus lentement sous GLP-1 — de petites portions évitent les nausées et l'inconfort.", icon: "🍽️" },
  { title: "S'hydrater en permanence", body: "Buvez 1,5 à 2 L d'eau par jour entre les repas (pas pendant), en petites gorgées. La déshydratation aggrave les effets secondaires.", icon: "💧" },
  { title: "Manger lentement", body: "Posez vos ustensiles entre les bouchées. Le signal de satiété peut prendre 15–20 min à se manifester, surtout en début de traitement.", icon: "🕐" },
  { title: "Prioriser les protéines", body: "Commencez chaque repas par les protéines et les légumes. Cela préserve la masse musculaire pendant la perte de poids.", icon: "💪" },
  { title: "Limiter les aliments acides/épicés", body: "Certains patients rapportent davantage de reflux. Réduisez les agrumes, tomates en sauce et plats très épicés si cela s'applique.", icon: "🌶️" },
  { title: "Planifier à l'avance", body: "Préparez vos repas en début de semaine (batch cooking). Quand la faim est réduite, il est facile de négliger de manger — ce qui nuit à la perte musculaire.", icon: "📅" },
];

/* ── Composants ──────────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0F7F4] text-2xl">{icon}</span>
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function NutritionPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="dash-enter rounded-3xl bg-gradient-to-br from-[#1D4D3A] to-[#163d2e] p-8 text-white shadow-xl">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#3EBD93]">Guide inclus — gratuit</p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Guide nutritionnel<br />GLP-1
        </h1>
        <p className="mt-3 text-base leading-relaxed text-white/80">
          Ce guide a été conçu spécifiquement pour les patients sous traitement GLP-1 (sémaglutide, liraglutide).
          Maximisez vos résultats et minimisez les effets secondaires grâce à des choix alimentaires adaptés.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {["Adapté GLP-1", "Validé cliniquement", "Mise à jour régulière"].map((tag) => (
            <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
              ✓ {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Alerte importante */}
      <Card className="border-amber-100 bg-amber-50">
        <div className="flex gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-900">Important</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              Ce guide est à titre informatif et éducatif. Il ne remplace pas les recommandations personnalisées
              de votre IPS ou médecin. Consultez votre équipe soignante avant de modifier significativement votre alimentation.
            </p>
          </div>
        </div>
      </Card>

      {/* Pourquoi l'alimentation est cruciale */}
      <Card>
        <SectionHeader icon="🎯" title="Pourquoi l'alimentation est si importante avec le GLP-1" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { stat: "20–30 %", label: "Perte de poids supplémentaire avec une alimentation adaptée vs alimentation standard" },
            { stat: "↓ 60 %", label: "Réduction des nausées avec le fractionnement des repas et l'hydratation adéquate" },
            { stat: "+15 %", label: "Maintien de la masse musculaire avec un apport protéique suffisant" },
          ].map((item) => (
            <div key={item.stat} className="rounded-xl bg-[#F0F7F4] p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#1D4D3A]">{item.stat}</p>
              <p className="mt-1 text-xs leading-snug text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Aliments recommandés */}
      <Card>
        <SectionHeader icon="✅" title="Aliments à privilégier" subtitle="Sources d'énergie qui soutiennent votre traitement" />
        <div className="space-y-6">
          {FOODS_RECOMMENDED.map((section) => (
            <div key={section.category}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">{section.icon}</span>
                <h3 className="font-semibold text-slate-800">{section.category}</h3>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#3EBD93]" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Aliments à éviter */}
      <Card>
        <SectionHeader icon="🚫" title="Aliments à limiter ou éviter" subtitle="Ils peuvent amplifier les effets secondaires ou freiner vos résultats" />
        <div className="space-y-2">
          {FOODS_AVOID.map((item) => (
            <div key={item.name} className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
              <div>
                <p className="text-sm font-semibold text-red-900">{item.name}</p>
                <p className="text-xs text-red-700">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Conseils pratiques */}
      <Card>
        <SectionHeader icon="💡" title="Conseils pratiques" subtitle="Habitudes quotidiennes pour optimiser votre traitement" />
        <div className="grid gap-4 sm:grid-cols-2">
          {TIPS.map((tip) => (
            <div key={tip.title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{tip.icon}</span>
                <p className="font-semibold text-slate-800">{tip.title}</p>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{tip.body}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Hydratation */}
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50">
        <SectionHeader icon="💧" title="Guide d'hydratation" subtitle="Essentiel pour minimiser les effets secondaires" />
        <div className="space-y-3">
          {[
            { time: "Au réveil", tip: "1–2 grands verres d'eau avant de manger" },
            { time: "Entre les repas", tip: "Sirotez régulièrement, évitez de boire pendant les repas (dilue les enzymes digestives)" },
            { time: "Après l'effort", tip: "Réhydratez-vous immédiatement après toute activité physique" },
            { time: "Le soir", tip: "Un dernier verre d'eau 1 h avant le coucher" },
          ].map((item) => (
            <div key={item.time} className="flex items-center gap-4 rounded-xl bg-white/70 px-4 py-3">
              <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wider text-blue-600">{item.time}</span>
              <p className="text-sm text-slate-700">{item.tip}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-blue-100 px-4 py-3">
          <p className="text-sm font-semibold text-blue-900">Objectif : 1,5 à 2 litres d&apos;eau pure par jour</p>
          <p className="mt-1 text-xs text-blue-700">Les tisanes non sucrées et bouillons clairs comptent aussi. Évitez les boissons sucrées, énergisantes et l&apos;alcool.</p>
        </div>
      </Card>

      {/* Plans de repas */}
      <Card>
        <SectionHeader icon="🗓️" title="Exemples de plans de repas" subtitle="Inspirations pour vos 3 premiers jours" />
        <div className="space-y-6">
          {MEAL_PLAN.map((day) => (
            <div key={day.day}>
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#1D4D3A]">{day.day}</p>
              <div className="space-y-2">
                {day.meals.map((item) => (
                  <div key={item.time} className="flex items-start gap-4 rounded-xl bg-[#F0F7F4] px-4 py-3">
                    <span className="w-20 shrink-0 text-xs font-bold text-[#1D4D3A]">{item.time}</span>
                    <p className="text-sm text-slate-700">{item.meal}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Ces exemples sont des guides généraux. Adaptez les portions à votre faim réelle — sous GLP-1, elle est naturellement réduite.
        </p>
      </Card>

      {/* Compléments */}
      <Card className="border-purple-100 bg-purple-50">
        <SectionHeader icon="💊" title="Compléments alimentaires recommandés" subtitle="Discutez avec votre IPS avant de commencer" />
        <div className="space-y-3">
          {[
            { name: "Multivitamine quotidienne", reason: "Compense la réduction des apports alimentaires" },
            { name: "Protéines en poudre (whey ou végétal)", reason: "Aide à atteindre les objectifs protéiques si l'appétit est réduit" },
            { name: "Magnésium (glycinate)", reason: "Réduit les crampes musculaires, améliore le sommeil" },
            { name: "Vitamine D3 + K2", reason: "Santé osseuse, souvent déficiente chez les personnes en surpoids" },
            { name: "Oméga-3 (EPA/DHA)", reason: "Santé cardiovasculaire, anti-inflammatoire" },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-3 rounded-xl bg-white/70 px-4 py-3">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-purple-400" />
              <div>
                <p className="text-sm font-semibold text-purple-900">{item.name}</p>
                <p className="text-xs text-purple-700">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA Anne */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1D4D3A] to-[#0f2e22] p-8 text-center text-white shadow-xl">
        <p className="text-3xl">✨</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Des questions personnalisées ?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Anne, votre coach IA, peut vous aider à adapter ce guide à vos préférences, vos contraintes alimentaires et vos objectifs personnels.
        </p>
        <Link
          href="/dashboard/patient/coach-ia"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#3EBD93] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#34a47d]"
        >
          Parler à Anne
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
