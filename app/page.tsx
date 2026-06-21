"use client";

import Link from "next/link";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ─── Palette Anne Santé ─── */
const EMERALD = "#0B4D3B";
const GOLD = "#C9A96E";
const OFF_WHITE = "#F8F8F6";

const HERO_IMG =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80";

const PATIENT_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    quote: "J'ai perdu 14 kg en 3 mois avec le suivi de Anne. Jamais eu faim.",
    name: "Marie",
    city: "Québec",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    quote: "Processus simple, livraison rapide. Mon IPS a répondu en moins de 48 h.",
    name: "Jean-François",
    city: "Montréal",
  },
  {
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80",
    quote: "Anne m'aide chaque jour avec la nutrition. Je me sens accompagnée.",
    name: "Sophie",
    city: "Laval",
  },
  {
    url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    quote: "Enfin une solution GLP-1 accessible au Québec, depuis chez moi.",
    name: "Isabelle",
    city: "Sherbrooke",
  },
];

const PRODUCTS = [
  {
    name: "Ozempic®",
    desc: "Sémaglutide hebdomadaire — référence pour la perte de poids et le diabète de type 2.",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
  },
  {
    name: "Wegovy®",
    desc: "Sémaglutide à dose optimisée pour l'obésité — approuvé pour la gestion du poids.",
    img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80",
  },
  {
    name: "Sémaglutide générique",
    desc: "Alternative abordable, même molécule active — disponible sur ordonnance IPS.",
    img: "https://images.unsplash.com/photo-1587854692152-cbf240142ba7?w=400&q=80",
    badge: "Nouveau",
  },
];

const IPS_TEAM = [
  {
    name: "Dr. Catherine Tremblay, IPS",
    specialty: "Endocrinologie · OIIQ",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
  },
  {
    name: "Dr. Amélie Gagnon, IPS",
    specialty: "Soins infirmiers spécialisés · OIIQ",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
  },
  {
    name: "Dr. Marie-Claire Lavoie, IPS",
    specialty: "Gestion du poids · OIIQ",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
  },
];

const FAQ_ITEMS = [
  {
    q: "Qu'est-ce qu'un agoniste GLP-1 ?",
    a: "Les GLP-1 (comme le sémaglutide) imitent une hormone naturelle qui régule l'appétit, ralentit la vidange gastrique et améliore la sensibilité à l'insuline. Ils sont prescrits pour la perte de poids chez les adultes obèses ou en surpoids avec comorbidités.",
  },
  {
    q: "Ai-je besoin d'une ordonnance ?",
    a: "Oui. Tous nos traitements GLP-1 nécessitent une ordonnance d'une infirmière praticienne spécialisée (IPS) certifiée OIIQ. Notre questionnaire médical en ligne permet à votre IPS d'évaluer votre éligibilité.",
  },
  {
    q: "Combien de temps avant d'obtenir mon ordonnance ?",
    a: "La majorité des dossiers sont révisés en moins de 48 heures ouvrables après soumission du questionnaire complet. Vous recevrez une notification par courriel dès l'approbation.",
  },
  {
    q: "Le médicament est-il livré chez moi ?",
    a: "Oui. Une fois l'ordonnance approuvée et le paiement confirmé, votre traitement GLP-1 est préparé par une pharmacie partenaire québécoise et livré discrètement à votre domicile.",
  },
  {
    q: "Qu'est-ce que le coach IA Anne inclut ?",
    a: "Anne est votre coach santé proactif : rappels de prise, suivi des effets secondaires, guide nutritionnel personnalisé pour les traitements GLP-1, et réponses à vos questions 24 h/24 en français.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Calculez votre IMC",
    desc: "Test d'éligibilité en 2 minutes — déterminez si un traitement GLP-1 vous convient.",
    icon: "📊",
  },
  {
    n: "02",
    title: "Questionnaire médical",
    desc: "Rempli en ligne, révisé par une IPS certifiée au Québec — sans rendez-vous en clinique.",
    icon: "📋",
  },
  {
    n: "03",
    title: "Ordonnance & livraison",
    desc: "Médicament GLP-1 livré discrètement à domicile par une pharmacie partenaire.",
    icon: "📦",
  },
];

/* ─── Helpers ─── */

function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 1800,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("fr-CA")}
      {suffix}
    </span>
  );
}

function ShimmerButton({
  href,
  children,
  variant = "emerald",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "emerald" | "gold" | "white";
  className?: string;
}) {
  const base =
    variant === "gold"
      ? "bg-[#C9A96E] text-[#0B4D3B]"
      : variant === "white"
        ? "bg-white text-[#0B4D3B]"
        : "bg-[#0B4D3B] text-white";

  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${base} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </Link>
  );
}

function CardHover({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(11,77,59,0.12)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`rounded-2xl bg-white shadow-md transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Page ─── */

export default function HomePage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setCarouselIdx((i) => (i + 1) % PATIENT_PHOTOS.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  const bmi = useCallback(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0) return null;
    return (w / (h * h)).toFixed(1);
  }, [height, weight]);

  const bmiValue = bmi();
  const bmiLabel =
    bmiValue === null
      ? null
      : parseFloat(bmiValue) >= 30
        ? "Obésité — éligible GLP-1"
        : parseFloat(bmiValue) >= 27
          ? "Surpoids — éligibilité possible"
          : "IMC normal";

  return (
    <div
      className="min-h-screen bg-white text-[#1A1A1A]"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* ── NAV ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          navScrolled
            ? "border-b border-white/10 bg-[#0B4D3B]/95 shadow-lg backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="font-serif text-xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Anne Santé
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {[
              ["#produits", "Médicaments"],
              ["#comment-ca-marche", "Comment ça marche"],
              ["#tarifs", "Tarifs"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-white/90 transition hover:text-white"
              >
                {label}
              </a>
            ))}
            <Link
              href="/connexion"
              className="rounded-full border border-white/40 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Connexion
            </Link>
          </nav>
          <Link
            href="/eligibilite"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0B4D3B] md:hidden"
          >
            Commencer
          </Link>
        </div>
      </header>

      {/* ── 1. HERO ── */}
      <section ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMG}
            alt="Femme active souriante"
            className="h-[120%] w-full object-cover object-center"
            style={{ willChange: "transform" }}
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, rgba(11,77,59,0.82) 0%, rgba(11,77,59,0.65) 100%)` }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/50 bg-[#C9A96E]/15 px-4 py-1.5 text-sm font-medium text-[#C9A96E]">
              ✦ Sémaglutide générique maintenant disponible
            </span>
            <h1
              className="mb-6 text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Perdez du poids durablement.
              <br />
              <span className="text-[#C9A96E]">Depuis chez vous.</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/85">
              Ordonnance GLP-1 par une IPS certifiée, coach IA Anne incluse — sans file
              d&apos;attente ni rendez-vous en clinique.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <ShimmerButton href="/eligibilite" variant="gold">
                Commencer — 149,99$/mois
              </ShimmerButton>
              <a
                href="#imc"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/60 px-8 py-4 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Calculer mon IMC
              </a>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-white/75">
              <span className="text-[#C9A96E]">★★★★★</span>
              Rejoignez 2&nbsp;400+ patients Anne-Santé
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. STATS ── */}
      <section className="bg-[#0B4D3B] py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 text-center sm:grid-cols-3 lg:px-8">
          {[
            { val: 2400, suffix: "+", label: "Patients accompagnés" },
            { val: 18, suffix: "%", label: "Perte de poids moyenne" },
            { val: 48, suffix: "h", prefix: "< ", label: "Délai d'approbation" },
          ].map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.15}>
              <p
                className="text-4xl font-bold text-white sm:text-5xl"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                <AnimatedCounter target={s.val} suffix={s.suffix} prefix={s.prefix ?? ""} />
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-widest text-white/60">
                {s.label}
              </p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── 3. COMMENT ÇA MARCHE + IMC ── */}
      <section id="comment-ca-marche" className="py-24" style={{ background: OFF_WHITE }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp className="mb-16 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Comment ça marche
            </h2>
            <p className="mt-4 text-[#1A1A1A]/70">
              Trois étapes simples pour démarrer votre parcours GLP-1 au Québec.
            </p>
          </FadeUp>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.12}>
                <CardHover className="h-full p-8">
                  <span className="text-3xl">{step.icon}</span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#C9A96E]">
                    Étape {step.n}
                  </p>
                  <h3
                    className="mt-2 text-xl font-bold"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/70">{step.desc}</p>
                </CardHover>
              </FadeUp>
            ))}
          </div>

          {/* IMC Calculator */}
          <FadeUp className="mt-16">
            <div
              id="imc"
              className="mx-auto max-w-lg rounded-2xl border border-[#0B4D3B]/10 bg-white p-8 shadow-lg"
            >
              <h3
                className="text-center text-xl font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
              >
                Calculateur IMC
              </h3>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/50">
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    className="mt-1 w-full rounded-xl border border-[#0B4D3B]/20 px-4 py-3 text-sm outline-none focus:border-[#0B4D3B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/50">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="85"
                    className="mt-1 w-full rounded-xl border border-[#0B4D3B]/20 px-4 py-3 text-sm outline-none focus:border-[#0B4D3B]"
                  />
                </div>
              </div>
              {bmiValue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 rounded-xl bg-[#0B4D3B]/5 p-4 text-center"
                >
                  <p className="text-3xl font-bold" style={{ color: EMERALD }}>
                    {bmiValue}
                  </p>
                  <p className="mt-1 text-sm text-[#1A1A1A]/70">{bmiLabel}</p>
                </motion.div>
              )}
              <div className="mt-6 text-center">
                <ShimmerButton href="/eligibilite" variant="emerald" className="w-full">
                  Vérifier mon éligibilité
                </ShimmerButton>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 4. CAROUSEL PATIENTS ── */}
      <section className="overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp className="mb-12 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Ils ont transformé leur vie
            </h2>
          </FadeUp>

          <div className="relative mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIdx}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-8 md:flex-row"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PATIENT_PHOTOS[carouselIdx].url}
                  alt={PATIENT_PHOTOS[carouselIdx].name}
                  className="h-64 w-64 shrink-0 rounded-full object-cover shadow-xl ring-4 ring-[#C9A96E]/30"
                />
                <blockquote className="text-center md:text-left">
                  <p
                    className="text-xl leading-relaxed italic"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    &ldquo;{PATIENT_PHOTOS[carouselIdx].quote}&rdquo;
                  </p>
                  <footer className="mt-4 text-sm font-semibold text-[#C9A96E]">
                    — {PATIENT_PHOTOS[carouselIdx].name}, {PATIENT_PHOTOS[carouselIdx].city}
                  </footer>
                </blockquote>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-center gap-2">
              {PATIENT_PHOTOS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Témoignage ${i + 1}`}
                  onClick={() => setCarouselIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === carouselIdx ? "w-8 bg-[#0B4D3B]" : "w-2 bg-[#0B4D3B]/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. COACH ANNE ── */}
      <section className="py-24" style={{ background: OFF_WHITE }}>
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-2 lg:px-8">
          <FadeUp>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A96E]">
              Coach IA inclus
            </span>
            <h2
              className="mt-4 text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Anne, votre coach IA proactif
            </h2>
            <p className="mt-6 leading-relaxed text-[#1A1A1A]/70">
              Suivi quotidien de votre traitement GLP-1, rappels de prise personnalisés, alertes
              d&apos;effets secondaires et guide nutritionnel adapté à votre profil — disponible
              24 h/24 en français québécois.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Rappels de dose hebdomadaire",
                "Guide protéines & nutrition GLP-1",
                "Suivi des effets secondaires",
                "Motivation et objectifs mensuels",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B4D3B] text-xs text-white">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-[#0B4D3B]/10">
              <div className="mb-4 flex items-center gap-3 border-b border-[#0B4D3B]/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B4D3B] text-sm font-bold text-white">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold">Anne · Coach IA</p>
                  <p className="text-xs text-[#1A1A1A]/50">En ligne</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#F8F8F6] px-4 py-3 text-sm">
                  Bonjour Marie! 👋 C&apos;est le jour de votre dose de sémaglutide. Prenez-la
                  après un repas léger riche en protéines.
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0B4D3B] px-4 py-3 text-sm text-white">
                  Merci Anne! J&apos;ai préparé un omelette aux légumes comme tu l&apos;avais
                  suggéré.
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#F8F8F6] px-4 py-3 text-sm">
                  Parfait! 🥚 Votre perte cette semaine est de 0,8 kg — vous êtes sur la bonne
                  voie. Continuez ainsi!
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="flex-1 rounded-full bg-[#F8F8F6] px-4 py-2.5 text-xs text-[#1A1A1A]/40">
                  Écrire à Anne…
                </div>
                <button
                  type="button"
                  className="rounded-full bg-[#0B4D3B] px-4 py-2.5 text-xs font-semibold text-white"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 6. PRODUITS GLP-1 ── */}
      <section id="produits" className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp className="mb-16 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Traitements GLP-1 disponibles
            </h2>
            <p className="mt-4 text-[#1A1A1A]/70">
              Prescrits par une IPS certifiée — livrés discrètement chez vous.
            </p>
          </FadeUp>

          <div className="grid gap-8 md:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <FadeUp key={p.name} delay={i * 0.1}>
                <CardHover className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} className="h-48 w-full object-cover" />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-lg font-bold"
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
                      >
                        {p.name}
                      </h3>
                      {"badge" in p && p.badge && (
                        <span className="shrink-0 rounded-full bg-[#C9A96E]/20 px-2 py-0.5 text-xs font-semibold text-[#C9A96E]">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/70">{p.desc}</p>
                    <span className="mt-4 inline-block rounded-full border border-[#0B4D3B]/20 px-3 py-1 text-xs font-medium text-[#0B4D3B]">
                      Ordonnance requise
                    </span>
                  </div>
                </CardHover>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. TARIFS ── */}
      <section id="tarifs" className="py-24" style={{ background: OFF_WHITE }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp className="mb-16 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Tarification simple
            </h2>
            <p className="mt-4 text-[#1A1A1A]/70">Une formule, tout inclus. Sans frais cachés.</p>
          </FadeUp>

          <FadeUp className="mx-auto max-w-md">
            <div
              className="rounded-3xl bg-white p-10 text-center shadow-xl"
              style={{ border: `2px solid ${GOLD}` }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#C9A96E]">
                Programme complet
              </p>
              <p
                className="mt-4 text-5xl font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
              >
                149,99$
                <span className="text-lg font-normal text-[#1A1A1A]/50">/mois</span>
              </p>
              <ul className="mt-8 space-y-3 text-left text-sm">
                {[
                  "Consultation IPS certifiée OIIQ",
                  "Ordonnance GLP-1 (médicament en sus)",
                  "Coach IA Anne — suivi 24 h/24",
                  "Guide nutritionnel personnalisé",
                  "Suivi mensuel & ajustements",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="text-[#C9A96E]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <ShimmerButton href="/eligibilite" variant="gold" className="w-full">
                  Commencer maintenant
                </ShimmerButton>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 8. ÉQUIPE IPS ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp className="mb-16 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Suivi par des professionnelles certifiées au Québec
            </h2>
            <p className="mt-4 text-[#1A1A1A]/70">
              Infirmières praticiennes spécialisées, membres de l&apos;OIIQ.
            </p>
          </FadeUp>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {IPS_TEAM.map((member, i) => (
              <FadeUp key={member.name} delay={i * 0.1}>
                <CardHover className="overflow-hidden text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.img}
                    alt={member.name}
                    className="h-56 w-full object-cover object-top"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold" style={{ color: EMERALD }}>
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#1A1A1A]/60">{member.specialty}</p>
                    <span className="mt-3 inline-block rounded-full bg-[#0B4D3B]/10 px-3 py-1 text-xs font-bold text-[#0B4D3B]">
                      OIIQ
                    </span>
                  </div>
                </CardHover>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section id="faq" className="py-24" style={{ background: OFF_WHITE }}>
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <FadeUp className="mb-12 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Questions fréquentes
            </h2>
          </FadeUp>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FadeUp key={item.q} delay={i * 0.05}>
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="pr-4 text-sm font-semibold" style={{ color: EMERALD }}>
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      className="shrink-0 text-xl text-[#C9A96E]"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="border-t border-[#0B4D3B]/10 px-6 pb-5 pt-2 text-sm leading-relaxed text-[#1A1A1A]/70">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. CTA FINAL ── */}
      <section className="bg-[#0B4D3B] py-24">
        <FadeUp className="mx-auto max-w-3xl px-5 text-center lg:px-8">
          <h2
            className="text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Prêt à commencer votre transformation ?
          </h2>
          <p className="mt-4 text-white/70">
            Rejoignez des milliers de Québécois qui ont choisi Anne Santé pour leur parcours
            GLP-1.
          </p>
          <div className="mt-10">
            <ShimmerButton href="/eligibilite" variant="white">
              Démarrer mon évaluation gratuite
            </ShimmerButton>
          </div>
        </FadeUp>
      </section>

      {/* ── 11. FOOTER ── */}
      <footer className="border-t border-[#0B4D3B]/10 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
              >
                Anne Santé
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/60">
                Plateforme de télésanté québécoise spécialisée en perte de poids GLP-1.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40">
                Navigation
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ["#produits", "Médicaments"],
                  ["#comment-ca-marche", "Comment ça marche"],
                  ["#tarifs", "Tarifs"],
                  ["#faq", "FAQ"],
                  ["/connexion", "Connexion"],
                ].map(([href, label]) => (
                  <li key={href}>
                    {href.startsWith("#") ? (
                      <a href={href} className="text-[#1A1A1A]/70 transition hover:text-[#0B4D3B]">
                        {label}
                      </a>
                    ) : (
                      <Link href={href} className="text-[#1A1A1A]/70 transition hover:text-[#0B4D3B]">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40">
                Avis légal
              </p>
              <p className="mt-4 text-xs leading-relaxed text-[#1A1A1A]/50">
                Anne Santé est une plateforme de télésanté opérée au Québec. Les services offerts ne
                remplacent pas une consultation médicale d&apos;urgence. Les traitements GLP-1
                (sémaglutide, Ozempic®, Wegovy®) sont des médicaments sur ordonnance soumis à
                évaluation par une infirmière praticienne spécialisée (IPS) membre de l&apos;OIIQ.
                Les résultats individuels varient. Consultez votre IPS pour toute question relative
                à votre santé. En cas d&apos;urgence, composez le 911.
              </p>
            </div>
          </div>
          <div className="mt-12 border-t border-[#0B4D3B]/10 pt-8 text-center text-xs text-[#1A1A1A]/40">
            © 2026 Anne Santé — Plateforme de télésanté québécoise
          </div>
        </div>
      </footer>
    </div>
  );
}
