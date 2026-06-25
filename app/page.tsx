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
const EMERALD_BRIGHT = "#10B981";
const OFF_WHITE = "#FAF9F6";

const HERO_IMG =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80";

/** Visuels produits — stylos injectables GLP-1 (fond blanc, jamais de gélules). */
const PEN_IMAGES = {
  ozempic: "/images/glp1-ozempic-pen.png",
  wegovy: "/images/glp1-wegovy-pen.png",
  generic: "/images/glp1-wegovy-pen-keep.png",
  mounjaro: "/images/glp1-mounjaro-pen.png",
  semaglutidePen:
    "https://images.unsplash.com/photo-1745939921744-ba8ef27940bf?w=600&q=85&fit=crop&auto=format",
} as const;

const PRODUCTS = [
  {
    name: "Ozempic®",
    badge: "Marque",
    desc: "Stylo sémaglutide — une injection hebdomadaire sur le ventre ou la cuisse.",
    img: PEN_IMAGES.ozempic,
    alt: "Ozempic pen injector on white background",
    local: true,
  },
  {
    name: "Wegovy®",
    badge: "Marque",
    desc: "Sémaglutide à dose optimisée pour l'obésité — auto-injecteur hebdomadaire.",
    img: PEN_IMAGES.wegovy,
    alt: "Wegovy autoinjector pen — GLP-1 weight management",
    local: true,
  },
  {
    name: "Sémaglutide composé",
    badge: "Compoundé",
    desc: "Préparation magistrale en pharmacie — stylo injectable, alternative abordable au Québec.",
    img: PEN_IMAGES.semaglutidePen,
    alt: "Semaglutide injection pen product photo on white background",
    local: false,
  },
  {
    name: "Apo-Sémaglutide",
    badge: "Générique",
    desc: "Sémaglutide générique canadien — même molécule, protocole d'injection identique.",
    img: PEN_IMAGES.generic,
    alt: "Apo-Sémaglutide generic GLP-1 injection pen",
    local: true,
  },
  {
    name: "Tirzepatide composé",
    badge: "Compoundé",
    desc: "Agoniste dual GIP/GLP-1 en stylo — préparé sur ordonnance IPS, livré chez vous.",
    img: PEN_IMAGES.mounjaro,
    alt: "GLP-1 injection pen medical — compounded tirzepatide",
    local: true,
  },
  {
    name: "Mounjaro®",
    badge: "Marque",
    desc: "Tirzepatide en stylo KwikPen — injection sous-cutanée hebdomadaire.",
    img: PEN_IMAGES.mounjaro,
    alt: "Mounjaro KwikPen autoinjector on white background",
    local: true,
  },
] as const;

type Product = (typeof PRODUCTS)[number];

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
    a: "Oui. Une fois l'ordonnance approuvée et le paiement confirmé, votre stylo injectable GLP-1 est préparé par une pharmacie partenaire québécoise et livré discrètement à votre domicile.",
  },
  {
    q: "Comment s'administre le traitement ?",
    a: "Vous vous injectez le médicament sous la peau, sur le ventre ou la cuisse — une fois par semaine, chez vous. Ce n'est pas une perfusion en clinique : un simple stylo prérempli que vous utilisez sur votre propre corps. Anne vous guide pour la technique et la rotation des sites d'injection.",
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
    title: "Injectez chez vous",
    desc: "Stylo livré à domicile — une piqûre sous-cutanée par semaine sur le ventre ou la cuisse, sans consultation en clinique.",
    icon: "💉",
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

function CtaButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/eligibilite"
      className={`inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 hover:shadow-md ${className}`}
      style={{ backgroundColor: EMERALD_BRIGHT }}
    >
      Démarrer mon parcours
    </Link>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group w-[300px] shrink-0 overflow-hidden rounded-2xl border border-[#0B4D3B]/8 bg-white shadow-sm transition-shadow hover:shadow-lg sm:w-[320px]">
      <div className="relative flex h-60 items-center justify-center overflow-hidden bg-white px-10 py-8">
        <div
          className="pointer-events-none absolute inset-3 rounded-xl border border-[#0B4D3B]/5 bg-gradient-to-b from-white to-[#FAFAFA]"
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.img}
          alt={product.alt}
          className={`relative z-10 drop-shadow-[0_8px_20px_rgba(11,77,59,0.1)] transition-transform duration-500 group-hover:scale-[1.05] ${
            product.local
              ? "max-h-44 w-auto max-w-[90%] object-contain"
              : "max-h-full max-w-full rounded-lg object-contain"
          }`}
        />
      </div>
      <div className="border-t border-[#0B4D3B]/6 bg-white p-5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-base font-bold leading-snug"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
          >
            {product.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              product.badge === "Compoundé"
                ? "bg-[#C9A96E]/20 text-[#8B7344]"
                : product.badge === "Générique"
                  ? "bg-[#0B4D3B]/10 text-[#0B4D3B]"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {product.badge}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#1A1A1A]/65">{product.desc}</p>
        <span className="mt-3 inline-block rounded-full border border-[#0B4D3B]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[#0B4D3B]">
          Ordonnance requise
        </span>
      </div>
    </article>
  );
}

function ProductsMarquee() {
  const track = [...PRODUCTS, ...PRODUCTS];
  return (
    <div className="products-marquee-mask relative mt-4 overflow-hidden">
      <div className="products-marquee-track flex w-max gap-5 px-2 py-2">
        {track.map((p, i) => (
          <ProductCard key={`${p.name}-${i}`} product={p} />
        ))}
      </div>
    </div>
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

const MOBILE_NAV_LINKS = [
  ["#produits", "Médicaments"],
  ["#comment-ca-marche", "Comment ça marche"],
  ["#tarifs", "Tarifs"],
  ["#faq", "FAQ"],
] as const;

export default function HomePage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      className="min-h-screen text-[#1A1A1A]"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", background: OFF_WHITE }}
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
            {MOBILE_NAV_LINKS.map(([href, label]) => (
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
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 md:hidden"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path strokeLinecap="round" d="M4 7h16" />
                  <path strokeLinecap="round" d="M4 12h16" />
                  <path strokeLinecap="round" d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-white/10 bg-[#0B4D3B]/98 backdrop-blur-md md:hidden"
            >
              <nav className="flex flex-col gap-1 px-5 py-4">
                {MOBILE_NAV_LINKS.map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </a>
                ))}
                <Link
                  href="/connexion"
                  className="mt-2 rounded-full border border-white/40 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
            className="max-w-2xl"
          >
            <h1
              className="mb-5 text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-[3.25rem]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Perdez du poids durablement.
            </h1>
            <p className="mb-10 max-w-lg text-lg text-white/90">
              Ordonnance GLP-1, coach IA et livraison discrète — tout depuis chez vous.
            </p>
            <CtaButton />
          </motion.div>
        </div>
      </section>

      {/* ── 2. STATS ── */}
      <section className="bg-[#0B4D3B] py-20">
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
      <section id="comment-ca-marche" className="py-28" style={{ background: OFF_WHITE }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp className="mb-20 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Comment ça marche
            </h2>
            <p className="mt-4 text-[#1A1A1A]/60">
              Trois étapes simples pour démarrer votre parcours GLP-1.
            </p>
          </FadeUp>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.12}>
                <CardHover className="h-full p-8">
                  <span className="text-3xl">{step.icon}</span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#10B981]">
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
          <FadeUp className="mt-24">
            <div
              id="imc"
              className="mx-auto max-w-lg rounded-2xl border border-[#0B4D3B]/8 bg-white p-8"
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
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 4. COACH ANNE ── */}
      <section className="py-28" style={{ background: OFF_WHITE }}>
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-2 lg:px-8">
          <FadeUp>
            <span className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
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
                "Guide injection sur le corps (ventre, cuisse)",
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
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#FAF9F6] px-4 py-3 text-sm">
                  Bonjour Marie! 👋 C&apos;est le jour de votre dose. Piquez-vous sur le ventre ou
                  la cuisse — pas besoin de clinique. Anne vous rappelle de faire tourner le site
                  d&apos;injection.
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0B4D3B] px-4 py-3 text-sm text-white">
                  Merci Anne! J&apos;ai préparé un omelette aux légumes comme tu l&apos;avais
                  suggéré.
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#FAF9F6] px-4 py-3 text-sm">
                  Parfait! 🥚 Votre perte cette semaine est de 0,8 kg — vous êtes sur la bonne
                  voie. Continuez ainsi!
                </div>
              </div>
              <div className="mt-4 rounded-full bg-[#FAF9F6] px-4 py-2.5 text-xs text-[#1A1A1A]/40">
                Écrire à Anne…
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 5. PRODUITS GLP-1 ── */}
      <section id="produits" className="py-28" style={{ background: OFF_WHITE }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp className="mb-16 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              Traitements GLP-1 disponibles
            </h2>
            <p className="mt-4 text-[#1A1A1A]/60">
              Stylos injectables livrés chez vous.
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <ProductsMarquee />
          </FadeUp>
        </div>
      </section>

      {/* ── 6. TARIFS ── */}
      <section id="tarifs" className="py-28" style={{ background: OFF_WHITE }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp className="text-center">
            <p
              className="text-5xl font-bold tracking-tight sm:text-6xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: EMERALD }}
            >
              149,99$
              <span className="text-xl font-normal text-[#1A1A1A]/45">/mois</span>
            </p>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#1A1A1A]/65">
              Consultation IPS · Coach IA Anne · Guide nutritionnel · Livraison
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── 7. FAQ ── */}
      <section id="faq" className="py-28" style={{ background: OFF_WHITE }}>
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
                      className="shrink-0 text-xl text-[#10B981]"
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

      {/* ── 8. CTA FINAL ── */}
      <section className="bg-[#0B4D3B] py-28">
        <FadeUp className="mx-auto max-w-2xl px-5 text-center lg:px-8">
          <h2
            className="text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Prêt à commencer ?
          </h2>
          <p className="mt-4 text-white/75">
            Calculez votre IMC en 2 minutes — sans engagement.
          </p>
          <div className="mt-10 flex justify-center">
            <CtaButton />
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#0B4D3B]/10 py-16" style={{ background: OFF_WHITE }}>
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
