"use client";

import { useCallback, useEffect, useState } from "react";
import type { Glp1Consents } from "@/lib/gdpr/consents";

type AccessEntry = {
  id: string;
  action: string;
  resource: string | null;
  timestamp: string;
};

const LABELS: Record<keyof Glp1Consents, string> = {
  medical: "Traitement médical par IPS (télémédecine)",
  dataSharing: "Partage avec l'équipe médicale",
  aiCoach: "Anne — coach santé IA (personnalisation)",
  privacy: "Politique de confidentialité (Loi 25)",
  marketing: "Communications marketing",
};

export function PatientPrivacyPanel() {
  const [consents, setConsents] = useState<Glp1Consents | null>(null);
  const [accessLog, setAccessLog] = useState<AccessEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [cRes, aRes] = await Promise.all([
      fetch("/api/gdpr/consents"),
      fetch("/api/gdpr/access-log"),
    ]);
    if (cRes.ok) setConsents((await cRes.json()) as Glp1Consents);
    if (aRes.ok) {
      const data = (await aRes.json()) as { entries: AccessEntry[] };
      setAccessLog(data.entries);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(key: keyof Glp1Consents) {
    if (!consents) return;
    setBusy(true);
    const res = await fetch("/api/gdpr/consents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: !consents[key] }),
    });
    setBusy(false);
    if (res.ok) setConsents((await res.json()) as Glp1Consents);
  }

  async function exportData() {
    setBusy(true);
    const res = await fetch("/api/gdpr/export");
    setBusy(false);
    if (!res.ok) {
      setMessage("Export impossible pour le moment.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medsim-mes-donnees.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Export téléchargé.");
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        "Cette action est irréversible. Votre compte sera anonymisé. Continuer ?",
      )
    ) {
      return;
    }
    setBusy(true);
    const res = await fetch("/api/gdpr/delete", { method: "POST" });
    setBusy(false);
    if (res.ok) {
      window.location.href = "/";
    } else {
      setMessage("Suppression impossible pour le moment.");
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Mes consentements</h2>
        <ul className="mt-4 space-y-3">
          {(Object.keys(LABELS) as (keyof Glp1Consents)[]).map((key) => (
            <li key={key} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#1A1A2E]">{LABELS[key]}</span>
              <button
                type="button"
                disabled={busy || !consents}
                onClick={() => void toggle(key)}
                className={`relative h-7 w-12 rounded-full transition ${
                  consents?.[key] ? "bg-[#3EBD93]" : "bg-[#E5E7EB]"
                }`}
                aria-pressed={consents?.[key]}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    consents?.[key] ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Vos droits (Loi 25)</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void exportData()}
            className="rounded-xl border border-[#1D4D3A] px-4 py-2 text-sm font-semibold text-[#1D4D3A]"
          >
            Télécharger mes données
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void deleteAccount()}
            className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
          >
            Supprimer mon compte
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-[#6B7280]">{message}</p> : null}
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Qui a consulté mon dossier</h2>
        {accessLog.length === 0 ? (
          <p className="mt-3 text-sm text-[#6B7280]">Aucune consultation enregistrée.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {accessLog.map((e) => (
              <li key={e.id} className="text-[#6B7280]">
                {new Intl.DateTimeFormat("fr-CA", { dateStyle: "medium", timeStyle: "short" }).format(
                  new Date(e.timestamp),
                )}{" "}
                — {e.resource ?? e.action}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
