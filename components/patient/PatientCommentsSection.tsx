"use client";

import Image from "next/image";
import { useState } from "react";
import {
  IPS_SHOWCASE_PROFILES,
  ipsCertifiedLabel,
  ipsPractitionerTitle,
  type IpsShowcaseProfile,
} from "@/lib/patient/ips-showcase";

function IpsCard({ profile }: { profile: IpsShowcaseProfile }) {
  return (
    <article className="w-[min(100vw-3rem,340px)] shrink-0 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-6 shadow-sm sm:w-[340px]">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
          <Image
            src={profile.photo}
            alt={profile.photoAlt}
            fill
            className="object-cover object-top"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[#E8F5F0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1D4D3A]">
              {ipsCertifiedLabel(profile.gender)}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {profile.years} ans d&apos;expérience
            </span>
          </div>
          <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
            &ldquo;{profile.quote}&rdquo;
          </blockquote>
          <footer className="mt-4 text-[13px] text-slate-600">
            <span className="font-semibold text-slate-900">{profile.name}</span>, {profile.city}
            <br />
            <span className="text-[var(--teal-900)]">
              {ipsPractitionerTitle(profile.gender)} · {profile.specialty}
            </span>
          </footer>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Domaines de pratique">
            {profile.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

const MARQUEE_ITEMS = [...IPS_SHOWCASE_PROFILES, ...IPS_SHOWCASE_PROFILES] as const;

export function PatientCommentsSection() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      id="ips-equipe"
      className="scroll-mt-24 border-t border-white/15 py-12 sm:py-16"
      aria-labelledby="ips-showcase-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="ips-showcase-heading"
          className="text-center text-2xl font-bold tracking-tight text-white sm:text-[28px]"
        >
          Nos infirmières et infirmiers praticiens spécialisés
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/85">
          Des IPS certifiés au Québec qui examinent votre dossier, prescrivent si approprié et
          assurent votre suivi GLP-1 — partout au Québec.
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
          {MARQUEE_ITEMS.map((profile, index) => (
            <IpsCard key={`${profile.id}-${index}`} profile={profile} />
          ))}
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-xl px-4 text-center text-[11px] leading-relaxed text-white/60">
        Portraits à titre illustratif. Votre IPS assignée apparaît dans votre espace patient après
        l&apos;évaluation de votre dossier.
      </p>
    </section>
  );
}
