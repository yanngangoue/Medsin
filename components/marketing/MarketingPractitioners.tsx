"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Practitioner = {
  id: string;
  name: string;
  title: string;
  specialty: string;
  tags: string[];
  photo?: string;
  isAi?: boolean;
};

const TEAM: Practitioner[] = [
  {
    id: "anne",
    name: "Anne — Coach IA MedSim",
    title: "Intelligence artificielle",
    specialty: "Analyse · Rappels · Rapports IPS",
    tags: ["Proactif", "GLP-1", "24 h/24"],
    isAi: true,
  },
  {
    id: "mc",
    name: "Marie-Claude F., IPS",
    title: "Soins première ligne · 12 ans",
    specialty: "Télémédecine · Québec",
    tags: ["GLP-1", "Télémédecine", "Québec"],
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
  },
  {
    id: "sb",
    name: "Sophie B., IPS",
    title: "Endocrinologie · 8 ans",
    specialty: "Obésité · diabète T2",
    tags: ["Diabète T2", "Obésité"],
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
  },
  {
    id: "jm",
    name: "Dr. Jean-François M.",
    title: "Médecin superviseur",
    specialty: "Protocoles cliniques",
    tags: ["Supervision", "Protocoles"],
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
  },
  {
    id: "at",
    name: "Amélie T., IPS",
    title: "Soins adultes · 6 ans",
    specialty: "Prévention · réponse rapide",
    tags: ["Prévention", "Réponse rapide"],
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
  },
];

function Card({ person }: { person: Practitioner }) {
  return (
    <article className="group w-64 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-[3/4] overflow-hidden">
        {person.isAi ? (
          <div className="relative flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#1D4D3A] to-[#3EBD93]">
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse-dot" />
              IA active 24 h/24
            </span>
            <span className="text-7xl font-black text-white">A</span>
          </div>
        ) : (
          <Image
            src={person.photo!}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="256px"
          />
        )}
      </div>
      <div className="space-y-2 bg-white p-5">
        <h3 className="font-bold text-[#1A1A2E]">{person.name}</h3>
        <p className="text-sm font-medium text-[#1D4D3A]">{person.title}</p>
        <p className="text-sm text-gray-500">{person.specialty}</p>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {person.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#F0F7F4] px-2.5 py-0.5 text-[10px] font-semibold text-[#1D4D3A]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function MarketingPractitioners() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ x: 0, left: 0 });

  function scroll(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section id="equipe" className="bg-[#FAFAF8] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="text-4xl font-black tracking-tight text-[#1A1A2E] md:text-5xl">
          Votre équipe de soins MedSim
        </h2>
        <p className="mt-4 max-w-xl text-lg text-gray-500">
          De vraies IPS québécoises + Anne, l&apos;IA qui ne dort jamais.
        </p>

        <div className="relative mt-14">
          <button
            type="button"
            onClick={() => scroll(-280)}
            className="absolute -left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-xl shadow-sm hover:bg-gray-50 lg:flex"
            aria-label="Précédent"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll(280)}
            className="absolute -right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-xl shadow-sm hover:bg-gray-50 lg:flex"
            aria-label="Suivant"
          >
            →
          </button>

          <div
            ref={scrollRef}
            className={`marketing-carousel flex cursor-grab gap-6 overflow-x-auto pb-2 ${dragging ? "cursor-grabbing" : ""}`}
            onPointerDown={(e) => {
              const el = scrollRef.current;
              if (!el) return;
              setDragging(true);
              drag.current = { x: e.clientX, left: el.scrollLeft };
              el.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!dragging || !scrollRef.current) return;
              scrollRef.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
            }}
            onPointerUp={(e) => {
              setDragging(false);
              scrollRef.current?.releasePointerCapture(e.pointerId);
            }}
          >
            {TEAM.map((p) => (
              <Card key={p.id} person={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
