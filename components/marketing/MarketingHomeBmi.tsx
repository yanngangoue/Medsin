"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { computeBmi } from "@/lib/eligibility";

function bmiLabel(bmi: number): { text: string; tone: "green" | "amber" | "gray" } {
  if (bmi <= 0) return { text: "Entrez votre taille et poids", tone: "gray" };
  if (bmi >= 27) return { text: "Profil généralement admissible au GLP-1", tone: "green" };
  if (bmi >= 25) return { text: "Évaluation IPS recommandée (IMC limite)", tone: "amber" };
  return { text: "IMC sous le seuil habituel — avis IPS possible", tone: "amber" };
}

function gaugeColor(bmi: number): string {
  if (bmi <= 0) return "#E5E7EB";
  if (bmi >= 27) return "#1D4D3A";
  if (bmi >= 25) return "#F59E0B";
  return "#94A3B8";
}

export function MarketingHomeBmi() {
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("85");

  const bmi = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return 0;
    return computeBmi(w, h);
  }, [height, weight]);

  const status = bmiLabel(bmi);
  const pct = bmi > 0 ? Math.min(100, (bmi / 40) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const dash = (pct / 100) * circumference;

  return (
    <section id="calculateur-imc" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-caps text-[#1D4D3A]">Éligibilité instantanée</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1A1A2E] sm:text-4xl">
            Calculez votre IMC en quelques secondes
          </h2>
          <p className="mt-3 text-gray-500">
            Estimation indicative — un professionnel confirmera votre admissibilité.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center">
            <div className="relative h-44 w-44">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#F3F4F6" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={gaugeColor(bmi)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black tabular-nums text-[#1A1A2E]">
                  {bmi > 0 ? bmi.toFixed(1) : "—"}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">IMC</span>
              </div>
            </div>
            <p
              className={`mt-4 max-w-xs text-center text-sm font-medium ${
                status.tone === "green"
                  ? "text-[#1D4D3A]"
                  : status.tone === "amber"
                    ? "text-amber-700"
                    : "text-gray-500"
              }`}
            >
              {status.text}
            </p>
          </div>

          <div className="space-y-5 rounded-3xl border border-gray-200 bg-[#FAFAF8] p-6 sm:p-8">
            <label className="block">
              <span className="text-sm font-semibold text-[#1A1A2E]">Taille (cm)</span>
              <input
                type="number"
                inputMode="numeric"
                min={120}
                max={230}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none ring-[#1D4D3A]/30 focus:border-[#1D4D3A] focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#1A1A2E]">Poids (kg)</span>
              <input
                type="number"
                inputMode="decimal"
                min={40}
                max={300}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none ring-[#1D4D3A]/30 focus:border-[#1D4D3A] focus:ring-2"
              />
            </label>
            <Link
              href="/eligibilite"
              className="flex w-full items-center justify-center rounded-full bg-[#1D4D3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Poursuivre mon évaluation complète →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
