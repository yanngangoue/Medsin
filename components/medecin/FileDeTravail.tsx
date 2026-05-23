"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  EMPTY_MEDECIN_FILE_RESPONSE,
  type MedecinFileDossierRow,
  type MedecinFileResponse,
} from "@/lib/medecin/file-response";

type DossierRow = MedecinFileDossierRow;

function normalizeFilePayload(raw: unknown): MedecinFileResponse {
  if (!raw || typeof raw !== "object") return EMPTY_MEDECIN_FILE_RESPONSE;
  const o = raw as Partial<MedecinFileResponse>;
  return {
    urgent: Array.isArray(o.urgent) ? o.urgent : [],
    nouveau: Array.isArray(o.nouveau) ? o.nouveau : [],
    enCours: Array.isArray(o.enCours) ? o.enCours : [],
    stats: {
      enAttente: o.stats?.enAttente ?? 0,
      traitesAujourdhui: o.stats?.traitesAujourdhui ?? 0,
      delaiMoyenHeures: o.stats?.delaiMoyenHeures ?? null,
    },
  };
}

function DossierCard({
  row,
  badge,
  badgeClass,
}: {
  row: DossierRow;
  badge: string;
  badgeClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
        {badge}
      </span>
      <p className="mt-2 font-semibold text-slate-900">{row.patientName}</p>
      <p className="text-xs text-slate-500">
        IMC {row.imc?.toFixed(1) ?? "—"} ·{" "}
        {new Date(row.createdAt).toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" })}
      </p>
      <Link
        href={`/medecin/dossier/${row.id}`}
        className="mt-3 inline-block rounded-lg bg-[#16a34a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#15803d]"
      >
        Examiner
      </Link>
    </div>
  );
}

function Column({
  title,
  rows,
  badge,
  badgeClass,
}: {
  title: string;
  rows: DossierRow[];
  badge: string;
  badgeClass: string;
}) {
  return (
    <div className="min-w-[260px] flex-1">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{title}</h2>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
            Aucun dossier
          </p>
        ) : (
          rows.map((r) => (
            <DossierCard key={r.id} row={r} badge={badge} badgeClass={badgeClass} />
          ))
        )}
      </div>
    </div>
  );
}

export function FileDeTravail() {
  const [data, setData] = useState<MedecinFileResponse>(EMPTY_MEDECIN_FILE_RESPONSE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/medecin/file");
      const json: unknown = await res.json().catch(() => null);
      setData(normalizeFilePayload(json));
      if (!res.ok) {
        const err =
          json && typeof json === "object" && "error" in json
            ? String((json as { error: unknown }).error)
            : "Impossible de charger la file";
        setLoadError(err);
      } else {
        setLoadError(null);
      }
    } catch {
      setData(EMPTY_MEDECIN_FILE_RESPONSE);
      setLoadError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 60_000);
    return () => clearInterval(t);
  }, [load]);

  const urgent = data.urgent ?? [];
  const nouveau = data.nouveau ?? [];
  const enCours = data.enCours ?? [];
  const stats = data.stats ?? EMPTY_MEDECIN_FILE_RESPONSE.stats;

  if (loading) return <p className="text-slate-500">Chargement de la file…</p>;

  return (
    <div>
      {loadError ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
          {loadError.includes("prisma generate") ? null : (
            <span className="block mt-1 text-xs">
              Si le problème persiste : <code className="font-mono">npx prisma generate</code> puis
              redémarrer le serveur.
            </span>
          )}
        </p>
      ) : null}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">En attente</p>
          <p className="text-3xl font-bold text-slate-900">{stats.enAttente}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Traités aujourd&apos;hui</p>
          <p className="text-3xl font-bold text-[#16a34a]">{stats.traitesAujourdhui}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Délai moyen</p>
          <p className="text-3xl font-bold text-slate-900">
            {stats.delaiMoyenHeures != null ? `${stats.delaiMoyenHeures} h` : "—"}
          </p>
        </div>
      </div>

      <p className="mb-4 text-xs text-slate-500">
        Chaque dossier doit être examiné individuellement. Aucune approbation automatique.
      </p>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:overflow-x-auto">
        <Column
          title="Urgent (> 48 h)"
          rows={urgent}
          badge="Urgent"
          badgeClass="bg-red-100 text-red-800"
        />
        <Column
          title="Nouveau"
          rows={nouveau}
          badge="Nouveau"
          badgeClass="bg-orange-100 text-orange-900"
        />
        <Column
          title="En cours de révision"
          rows={enCours}
          badge="En cours"
          badgeClass="bg-blue-100 text-blue-800"
        />
      </div>
    </div>
  );
}
