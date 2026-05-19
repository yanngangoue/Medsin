"use client";

import { useState } from "react";

const COMMENTS = [
  {
    initials: "MD",
    bg: "bg-rose-100 text-rose-800",
    quote:
      "Le suivi est clair et humain. J'ai pu avancer sur mes objectifs sans me sentir seule dans le parcours.",
    name: "Marie D.",
    loc: "Québec",
    service: "Gestion du poids",
  },
  {
    initials: "PL",
    bg: "bg-sky-100 text-sky-800",
    quote:
      "Nutri + m'a aidé à structurer mes repas. Les recommandations sont simples à suivre au quotidien.",
    name: "Pierre L.",
    loc: "Montréal",
    service: "Nutri +",
  },
  {
    initials: "SM",
    bg: "bg-emerald-100 text-emerald-800",
    quote:
      "Les repas santé livrés en une fois, c'est parfait pour ma semaine. Bonne qualité et portions adaptées.",
    name: "Sophie M.",
    loc: "Laval",
    service: "Repas santé",
  },
  {
    initials: "JC",
    bg: "bg-violet-100 text-violet-800",
    quote:
      "L'équipe répond vite et les explications sont claires. Je me sens accompagné à chaque étape.",
    name: "Jean C.",
    loc: "Gatineau",
    service: "Gestion du poids",
  },
  {
    initials: "AL",
    bg: "bg-amber-100 text-amber-800",
    quote:
      "Commander ma boîte repas sur MedSim est simple. Les plats des restos partenaires sont vraiment bons.",
    name: "Amélie L.",
    loc: "Sherbrooke",
    service: "Repas santé",
  },
  {
    initials: "NB",
    bg: "bg-teal-100 text-teal-800",
    quote:
      "Enfin une plateforme où tout est au même endroit : médecin, nutrition et repas. Ça simplifie vraiment ma semaine.",
    name: "Nadia B.",
    loc: "Trois-Rivières",
    service: "Nutri +",
  },
  {
    initials: "RT",
    bg: "bg-orange-100 text-orange-800",
    quote:
      "J'avais peur de commencer un parcours en ligne. L'accompagnement est rassurant et très professionnel.",
    name: "Robert T.",
    loc: "Longueuil",
    service: "Gestion du poids",
  },
  {
    initials: "CL",
    bg: "bg-pink-100 text-pink-800",
    quote:
      "Ma boîte de 5 repas couvre ma semaine de travail. Plus besoin de commander à la dernière minute.",
    name: "Chloé L.",
    loc: "Brossard",
    service: "Repas santé",
  },
  {
    initials: "FM",
    bg: "bg-indigo-100 text-indigo-800",
    quote:
      "Les compléments Nutri + sont bien expliqués. Je sais exactement pourquoi je les prends et comment.",
    name: "François M.",
    loc: "Saguenay",
    service: "Nutri +",
  },
  {
    initials: "IG",
    bg: "bg-lime-100 text-lime-800",
    quote:
      "Mon nutritionniste a adapté mon plan après ma première consultation. On sent un vrai suivi personnalisé.",
    name: "Isabelle G.",
    loc: "Lévis",
    service: "Nutri +",
  },
  {
    initials: "HD",
    bg: "bg-cyan-100 text-cyan-800",
    quote:
      "La livraison unique pour tous mes repas, c'est exactement ce qu'il me fallait. Tout arrive frais le même jour.",
    name: "Hugo D.",
    loc: "Drummondville",
    service: "Repas santé",
  },
  {
    initials: "EV",
    bg: "bg-fuchsia-100 text-fuchsia-800",
    quote:
      "J'ai perdu du poids de façon progressive, sans extrêmes. L'équipe médicale est à l'écoute quand j'ai des questions.",
    name: "Émilie V.",
    loc: "Terrebonne",
    service: "Gestion du poids",
  },
  {
    initials: "MP",
    bg: "bg-stone-200 text-stone-800",
    quote:
      "Interface claire, processus simple. Mon conjoint et moi commandons nos boîtes repas en quelques minutes.",
    name: "Marc P.",
    loc: "Granby",
    service: "Repas santé",
  },
  {
    initials: "LS",
    bg: "bg-red-100 text-red-800",
    quote:
      "Je recommande MedSim à mes collègues. Le parcours GLP-1 est bien encadré et les résultats sont là.",
    name: "Luc S.",
    loc: "Rimouski",
    service: "Gestion du poids",
  },
] as const;

type Comment = (typeof COMMENTS)[number];

function CommentCard({ comment }: { comment: Comment }) {
  const { initials, bg, quote, name, loc, service } = comment;
  return (
    <article className="w-[min(100vw-3rem,340px)] shrink-0 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-6 shadow-sm sm:w-[340px]">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${bg}`}
          aria-hidden
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] text-amber-500" aria-hidden>
            ★★★★★
          </p>
          <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <footer className="mt-4 text-[13px] text-slate-600">
            <span className="font-semibold text-slate-900">{name}</span>, {loc}
            <br />
            <span className="text-[var(--teal-900)]">{service}</span>
          </footer>
        </div>
      </div>
    </article>
  );
}

/** Deux séries identiques pour une boucle sans couture */
const MARQUEE_ITEMS = [...COMMENTS, ...COMMENTS] as const;

export function PatientCommentsSection() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      id="commentaires"
      className="scroll-mt-24 border-t border-slate-200/80 bg-white py-12 sm:py-16"
      aria-labelledby="comments-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="comments-heading"
          className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]"
        >
          Commentaires de nos patients
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600">
          Des parcours variés, un même accompagnement : santé métabolique, nutrition et repas équilibrés.
        </p>
      </div>

      <div
        className="comments-marquee-mask relative mt-10 w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <div
          className="comments-marquee-track flex w-max gap-6 px-4 sm:px-6"
          style={{ animationPlayState: paused ? "paused" : "running" }}
          aria-live="off"
        >
          {MARQUEE_ITEMS.map((comment, index) => (
            <CommentCard key={`${comment.name}-${index}`} comment={comment} />
          ))}
        </div>
      </div>
    </section>
  );
}
