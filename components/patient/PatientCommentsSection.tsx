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
      "Nutri+ m'a aidé à structurer mon alimentation. Les recommandations sont simples à suivre au quotidien.",
    name: "Pierre L.",
    loc: "Montréal",
    service: "Nutri +",
  },
  {
    initials: "SM",
    bg: "bg-emerald-100 text-emerald-800",
    quote:
      "Le catalogue compléments est clair : je comprends quel produit correspond à quel objectif Nutri+.",
    name: "Sophie M.",
    loc: "Laval",
    service: "Catalogue Nutri+",
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
    initials: "FM",
    bg: "bg-indigo-100 text-indigo-800",
    quote:
      "Les compléments Nutri+ sont bien expliqués. Je sais exactement pourquoi je les prends et comment.",
    name: "François M.",
    loc: "Saguenay",
    service: "Nutri +",
  },
  {
    initials: "IG",
    bg: "bg-lime-100 text-lime-800",
    quote:
      "Mon plan nutritionnel a été adapté après ma première consultation. On sent un vrai suivi personnalisé.",
    name: "Isabelle G.",
    loc: "Lévis",
    service: "Nutri +",
  },
  {
    initials: "RT",
    bg: "bg-orange-100 text-orange-800",
    quote:
      "J'avais peur de commencer un parcours en ligne. L'accompagnement Nutri+ est rassurant et professionnel.",
    name: "Robert T.",
    loc: "Longueuil",
    service: "Nutri +",
  },
  {
    initials: "EV",
    bg: "bg-fuchsia-100 text-fuchsia-800",
    quote:
      "J'ai consolidé mes résultats grâce au suivi Nutri+. L'espace patient MedSim est simple et efficace.",
    name: "Émilie V.",
    loc: "Terrebonne",
    service: "Nutri +",
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
          Des parcours variés, un même accompagnement : gestion du poids, Nutri+ et catalogue compléments.
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
