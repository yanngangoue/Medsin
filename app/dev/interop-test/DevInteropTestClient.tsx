"use client";

import { useCallback, useState } from "react";
import type { Role } from "@prisma/client";

type Props = {
  userId: string;
  role: Role;
  prenom: string;
};

export default function DevInteropTestClient({ userId, role, prenom }: Props) {
  const [log, setLog] = useState<string>("");
  const [patientIdForPro, setPatientIdForPro] = useState(userId);

  const append = useCallback((title: string, body: unknown) => {
    setLog((prev) => prev + `\n\n--- ${title} ---\n${JSON.stringify(body, null, 2)}`);
  }, []);

  const run = useCallback(
    async (title: string, path: string, init?: RequestInit) => {
      const method = init?.method ?? "POST";
      const baseHeaders: Record<string, string> = { "x-medisim-tenant": "QC" };
      if (method !== "GET") baseHeaders["Content-Type"] = "application/json";
      const res = await fetch(path, {
        method,
        headers: { ...baseHeaders, ...(init?.headers as Record<string, string>) },
        ...(method === "GET" ? {} : { body: init?.body }),
      });
      const text = await res.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }
      append(`${title} (${res.status})`, json);
    },
    [append],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Test interop métabolique</h1>
        <p className="mt-1 text-sm text-slate-600">
          Connecté : <strong>{prenom}</strong> — rôle <code className="rounded bg-slate-100 px-1">{role}</code> — id{" "}
          <code className="break-all rounded bg-slate-100 px-1 text-xs">{userId}</code>
        </p>
        <p className="mt-2 text-xs text-amber-800">
          Page réservée au développement (ou si <code className="rounded bg-amber-100 px-0.5">MEDSIM_ENABLE_DEV_INTEROP_PAGE=true</code>
          ).
        </p>
      </div>

      {role === "PATIENT" && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Patient — flux recommandé</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-[#1D9E75] px-3 py-2 text-sm font-medium text-white hover:bg-[#188763]"
              onClick={() =>
                run(
                  "Consentement alimentaire",
                  "/api/interop/v1/metabolic/consent/dietary",
                  { body: JSON.stringify({ optIn: true, version: "1.0" }) },
                )
              }
            >
              1. Consentement (opt-in)
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() =>
                run(
                  "Repas",
                  "/api/interop/v1/metabolic/intake/meal",
                  {
                    body: JSON.stringify({
                      items: [{ name: "Salade test", proteinG: 12, carbG: 18, fatG: 6, energyKcal: 220 }],
                    }),
                  },
                )
              }
            >
              2. Repas
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() =>
                run(
                  "Complément",
                  "/api/interop/v1/metabolic/intake/supplement",
                  { body: JSON.stringify({ productName: "Vitamine D", doseText: "1000 UI" }) },
                )
              }
            >
              Complément
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() =>
                run("Sommeil", "/api/interop/v1/metabolic/intake/sleep", {
                  body: JSON.stringify({ hours: 7.5, quality: "good" }),
                })
              }
            >
              Sommeil
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() =>
                run("Activité", "/api/interop/v1/metabolic/intake/activity", {
                  body: JSON.stringify({ minutes: 35, intensity: "moderate" }),
                })
              }
            >
              Activité
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() =>
                run("GLP-1", "/api/interop/v1/metabolic/intake/glp1", {
                  body: JSON.stringify({ productDisplay: "Semaglutide (exemple)", dosageText: "0.5 mg" }),
                })
              }
            >
              GLP-1
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900"
              onClick={async () => {
                const res = await fetch("/api/dev/metabolic-recompute", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({}),
                });
                const json = await res.json().catch(() => ({}));
                append(`Recalcul profil (${res.status})`, json);
              }}
            >
              3. Recalcul profil (serveur)
            </button>
          </div>
        </section>
      )}

      {(role === "MEDECIN" || role === "ADMIN") && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Médecin — dashboard</h2>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              Patient (UUID)
              <input
                className="w-72 rounded border border-slate-300 px-2 py-1 font-mono text-sm"
                value={patientIdForPro}
                onChange={(e) => setPatientIdForPro(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="rounded-lg bg-[#1D9E75] px-3 py-2 text-sm font-medium text-white"
              onClick={() =>
                run(
                  "Dashboard médecin",
                  `/api/interop/v1/metabolic/dashboard/doctor/${encodeURIComponent(patientIdForPro.trim())}`,
                  { method: "GET" },
                )
              }
            >
              GET dashboard médecin
            </button>
          </div>
        </section>
      )}

      {(role === "NUTRITIONNISTE" || role === "ADMIN") && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Nutritionniste — dashboard</h2>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              Patient (UUID)
              <input
                className="w-72 rounded border border-slate-300 px-2 py-1 font-mono text-sm"
                value={patientIdForPro}
                onChange={(e) => setPatientIdForPro(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="rounded-lg bg-[#1D9E75] px-3 py-2 text-sm font-medium text-white"
              onClick={() =>
                run(
                  "Dashboard nutritionniste",
                  `/api/interop/v1/metabolic/dashboard/nutritionist/${encodeURIComponent(patientIdForPro.trim())}`,
                  { method: "GET" },
                )
              }
            >
              GET dashboard nutritionniste
            </button>
          </div>
        </section>
      )}

      {role !== "PATIENT" && role !== "MEDECIN" && role !== "NUTRITIONNISTE" && role !== "ADMIN" && (
        <p className="text-sm text-slate-600">Aucune action rapide pour ce rôle sur cette page.</p>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Journal des réponses</h2>
        <pre className="max-h-[480px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-3 text-xs text-emerald-100">
          {log || "Clique sur un bouton pour voir la réponse JSON ici."}
        </pre>
      </section>
    </div>
  );
}
