"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormulaireOrdonnance } from "@/components/medecin/FormulaireOrdonnance";
import { SignatureNumerique } from "@/components/medecin/SignatureNumerique";

export default function MedecinOrdonnancePage() {
  const params = useParams();
  const dossierId = params.dossierId as string;
  const router = useRouter();
  const [meta, setMeta] = useState<{
    patientName: string;
    medecinName: string;
    license: string | null;
    status: string;
    prescriptionId: string | null;
  } | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/medecin/dossier/${dossierId}`);
    if (!res.ok) return;
    const data = await res.json();
    const d = data.dossier;
    setMeta({
      patientName: d.patient.prenom || d.patient.name || "Patient",
      medecinName: data.medecin.name,
      license: data.medecin.license,
      status: d.status,
      prescriptionId: d.prescription?.id ?? null,
    });
    if (d.prescription?.id) setPrescriptionId(d.prescription.id);
  }, [dossierId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!meta) {
    return <p className="p-8 text-slate-500">Chargement…</p>;
  }

  if (meta.status !== "APPROUVE") {
    return (
      <div className="mx-auto max-w-lg p-8">
        <p className="text-red-700">
          Ordonnance accessible uniquement après approbation du dossier par un médecin.
        </p>
        <Link href={`/medecin/dossier/${dossierId}`} className="mt-4 inline-block text-[#16a34a]">
          Retour au dossier
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/medecin/dossier/${dossierId}`} className="text-sm text-[#16a34a] hover:underline">
        ← Dossier patient
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Ordonnance GLP-1</h1>
      <p className="mt-1 text-sm text-slate-600">
        Rédaction et signature par le médecin connecté uniquement.
      </p>

      <div className="mt-8 space-y-8">
        {!prescriptionId ? (
          <FormulaireOrdonnance
            dossierId={dossierId}
            patientName={meta.patientName}
            medecinName={meta.medecinName}
            license={meta.license}
            onCreated={(id) => setPrescriptionId(id)}
          />
        ) : (
          <SignatureNumerique
            prescriptionId={prescriptionId}
            onSigned={() => router.push("/medecin/ordonnances")}
          />
        )}
      </div>
    </div>
  );
}
