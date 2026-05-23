import { FileDeTravail } from "@/components/medecin/FileDeTravail";
import { hasDossierGlp1Model } from "@/lib/medecin/prisma-dossier";

export default function MedecinFilePage() {
  const prismaReady = hasDossierGlp1Model();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">File de dossiers à traiter</h1>
      <p className="mt-1 text-sm text-slate-600">
        Chaque dossier doit être ouvert et validé par vous — aucune automatisation.
      </p>
      {!prismaReady ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Le modèle <strong>DossierGlp1</strong> n&apos;est pas chargé dans le client Prisma.
          Arrêtez le serveur, puis exécutez{" "}
          <code className="rounded bg-red-100 px-1 font-mono text-xs">npx prisma generate</code> et{" "}
          <code className="rounded bg-red-100 px-1 font-mono text-xs">npx prisma db push</code>.
        </p>
      ) : null}
      <div className="mt-6">
        <FileDeTravail />
      </div>
    </div>
  );
}
