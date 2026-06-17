"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ConsultationStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { QuestionnaireSectionsView } from "@/components/ips/QuestionnaireSectionsView";
import {
  patientDisplayName,
  patientInitials,
  statusColorClass,
  statusLabel,
} from "@/lib/ips/queue-utils";

type QuestionnaireDetail = {
  questionnaire: {
    id: string;
    status: string;
    height: number;
    weight: number;
    bmi: number;
    targetWeight: number;
    medicalHistory: Record<string, unknown>;
    currentMedications: unknown;
    allergies: unknown;
    familyHistory: unknown;
    hasTried: boolean;
    previousAttempts: string | null;
    motivations: string;
    bloodPressure: string | null;
    ipsNotes: string | null;
    user: { prenom: string; name?: string | null; email: string };
    medicationFulfillment: { id: string } | null;
  };
  aiSummary: string;
  age: number | null;
  receivedAt: string;
};

const MEDICATIONS = [
  { value: "Ozempic (sémaglutide)", label: "Ozempic" },
  { value: "Wegovy (sémaglutide)", label: "Wegovy" },
  { value: "Sémaglutide générique", label: "Générique" },
];

const DOSES = ["0,25 mg", "0,5 mg", "1 mg", "1,7 mg", "2,4 mg"];
const DURATIONS = [1, 2, 3, 6, 12];

type Props = { questionnaireId: string };

function yesNo(v: unknown): string {
  if (v === "oui") return "Oui";
  if (v === "non") return "Non";
  return "—";
}

function formatMedications(meds: unknown): string {
  if (!meds) return "Aucun déclaré";
  if (typeof meds === "string") return meds || "Aucun déclaré";
  if (Array.isArray(meds)) {
    const lines = meds
      .map((m) => {
        if (typeof m === "object" && m && "name" in m) return String((m as { name: string }).name);
        return null;
      })
      .filter(Boolean);
    return lines.length ? lines.join("\n") : "Aucun déclaré";
  }
  return "Aucun déclaré";
}

function formatHealthSummary(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "—";
  if (value.some((id) => String(id).startsWith("none_health"))) return "Aucune déclarée";
  return `${value.length} élément(s) coché(s)`;
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800"
      >
        {title}
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="border-t border-slate-100 px-4 py-3">{children}</div> : null}
    </div>
  );
}

export function IpsQuestionnaireReview({ questionnaireId }: Props) {
  const router = useRouter();
  const [data, setData] = useState<QuestionnaireDetail | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [ipsNotes, setIpsNotes] = useState("");
  const [medication, setMedication] = useState(MEDICATIONS[0].value);
  const [dosage, setDosage] = useState(DOSES[0]);
  const [duration, setDuration] = useState(1);
  const [refills, setRefills] = useState(2);
  const [instructions, setInstructions] = useState(
    "Injecter sous-cutanément une fois par semaine, même jour chaque semaine.",
  );
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/ips/questionnaires/${questionnaireId}`);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(
        res.status === 403
          ? (j.error ??
              "Accès refusé — ce dossier est peut-être assigné à une autre IPS. Retournez à la file d'attente.")
          : (j.error ?? "Impossible de charger le dossier."),
      );
      setLoading(false);
      return;
    }
    const json = (await res.json()) as QuestionnaireDetail;
    setData(json);
    setAiSummary(json.aiSummary);
    setIpsNotes(json.questionnaire.ipsNotes ?? "");
    setLoading(false);
  }, [questionnaireId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/ips/questionnaires/${questionnaireId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Action échouée");
      return null;
    }
    return res.json() as Promise<Record<string, unknown>>;
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="p-6 text-sm text-red-600">{error ?? "Dossier introuvable"}</p>;
  }

  const q = data.questionnaire;
  const history = q.medicalHistory as Record<string, unknown>;
  const allergies = q.allergies as Record<string, unknown>;
  const meds = q.currentMedications;
  const displayName = patientDisplayName(q.user.prenom, q.user.name ?? null);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/ips"
            className="text-sm font-semibold text-[#1D4D3A] hover:underline"
          >
            ← File d&apos;attente
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-sm font-bold text-[#1D4D3A]">
              {patientInitials(q.user.prenom, q.user.name ?? null)}
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{displayName}</h1>
              <p className="text-sm text-slate-500">
                {data.age != null ? `${data.age} ans` : "Âge non précisé"} · IMC{" "}
                {q.bmi.toFixed(1)} · {q.user.email}
              </p>
            </div>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${statusColorClass(q.status as ConsultationStatus)}`}
        >
          {statusLabel(q.status as ConsultationStatus)}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* Colonne 1 — Résumé patient */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1D4D3A]">
            Résumé patient
          </h2>

          <div>
            <h3 className="text-xs font-semibold text-slate-500">Données biométriques</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-800">
              <li>Taille : {q.height} cm</li>
              <li>Poids : {q.weight} kg</li>
              <li>IMC : {q.bmi.toFixed(1)}</li>
              <li>Objectif : {q.targetWeight} kg</li>
              {history.waistCm != null ? <li>Tour de taille : {String(history.waistCm)} cm</li> : null}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500">Médicaments actuels</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
              {formatMedications(meds)}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500">Allergies</h3>
            <p className="mt-2 text-sm text-slate-800">{String(allergies.text ?? "Aucune déclarée")}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500">Antécédents cliniques</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-800">
              <li>Conditions graves à dépister : {formatHealthSummary(history.health1)}</li>
              <li>Antécédents (1/2) : {formatHealthSummary(history.health2)}</li>
              <li>Antécédents (2/2) : {formatHealthSummary(history.health3)}</li>
              <li>Opioïdes (3 mois) : {yesNo(history.opioids3Months)}</li>
              <li>Chirurgie bariatrique : {yesNo(history.bariatricSurgery)}</li>
              <li>GLP-1 antérieur : {q.hasTried ? "Oui" : "Non"}</li>
            </ul>
          </div>
        </section>

        {/* Colonne 2 — Anne + questionnaire */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-[#3EBD93]/30 bg-gradient-to-br from-[#F0F7F4] to-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3EBD93] text-xs font-bold text-white">
                  A
                </span>
                <h2 className="text-sm font-bold text-[#1D4D3A]">Résumé généré par Anne</h2>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {aiSummary}
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const result = await patch({ action: "regenerate_summary" });
                setBusy(false);
                if (result && typeof result.aiSummary === "string") {
                  setAiSummary(result.aiSummary);
                }
              }}
              className="mt-4 text-sm font-semibold text-[#1D4D3A] hover:underline disabled:opacity-50"
            >
              Régénérer le résumé
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">Questionnaire médical</h2>
            <CollapsibleSection title="Biométrie & objectifs" defaultOpen>
              <QuestionnaireSectionsView q={q} />
            </CollapsibleSection>
            <CollapsibleSection title="Motivation & mode de vie">
              <p className="text-sm text-slate-700">{q.motivations}</p>
              <p className="mt-2 text-sm text-slate-600">
                Activité : {String(history.activityDays ?? "—")} · Sommeil :{" "}
                {String(history.sleepHours)} h · Stress : {String(history.stressLevel)}/5
              </p>
            </CollapsibleSection>
            {q.previousAttempts ? (
              <CollapsibleSection title="Tentatives antérieures">
                <p className="text-sm text-slate-700">{q.previousAttempts}</p>
              </CollapsibleSection>
            ) : null}
          </div>
        </section>

        {/* Colonne 3 — Actions IPS */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1D4D3A]">Actions IPS</h2>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Notes IPS</span>
            <textarea
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#1D4D3A]"
              rows={4}
              value={ipsNotes}
              onChange={(e) => setIpsNotes(e.target.value)}
              placeholder="Notes cliniques libres…"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void patch({ action: "save_notes", ipsNotes })}
            className="text-xs font-semibold text-[#1D4D3A] hover:underline"
          >
            Enregistrer les notes
          </button>

          {q.status !== "PRESCRIPTION_ISSUED" ? (
            <>
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-900">Ordonnance</h3>
                <div className="mt-3 space-y-3">
                  <label className="block text-xs font-medium text-slate-600">
                    Médicament
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                    >
                      {MEDICATIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Dose initiale
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                    >
                      {DOSES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Durée
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    >
                      {DURATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} mois
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Renouvellements
                    <input
                      type="number"
                      min={0}
                      max={12}
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                      value={refills}
                      onChange={(e) => setRefills(Number(e.target.value))}
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Instructions
                    <textarea
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                      rows={3}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    const result = await patch({
                      action: "approve",
                      ipsNotes,
                      medication,
                      dosage,
                      duration,
                      refills,
                      instructions,
                    });
                    if (result) router.push("/dashboard/ips");
                  }}
                  className="flex w-full items-center justify-center rounded-xl bg-[#3EBD93] py-3 text-sm font-bold text-white hover:bg-[#35a882] disabled:opacity-50"
                >
                  Approuver & Générer PDF
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    await patch({ action: "refer", ipsNotes });
                  }}
                  className="flex w-full items-center justify-center rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  Référer au médecin
                </button>
                <div className="rounded-xl border border-red-200 p-3">
                  <label className="block text-xs font-medium text-red-800">Motif de rejet</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-red-100 p-2 text-sm"
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const result = await patch({
                        action: "reject",
                        rejectReason,
                        ipsNotes,
                      });
                      if (result) router.push("/dashboard/ips");
                    }}
                    className="mt-2 w-full rounded-xl border-2 border-red-600 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Rejeter avec motif
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              Ordonnance émise
              {q.medicationFulfillment ? ` — livraison ${q.medicationFulfillment.id}` : ""}
            </p>
          )}
        </section>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
