"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  GLP1_EVALUATION_PATH,
  glp1EvaluationEntryHref,
  glp1InscriptionHref,
} from "@/lib/patient/glp1-flow-routes";

type Props = {
  className?: string;
  children?: React.ReactNode;
  showGuestLinks?: boolean;
};

/** Bouton principal : évaluation si connecté (patient), sinon connexion requise. */
export function Glp1EvaluationEntryCta({
  className,
  children = "Commencer mon évaluation GLP-1",
  showGuestLinks = true,
}: Props) {
  const { status, data } = useSession();
  const isPatient =
    status === "authenticated" && data?.user?.role === "PATIENT";
  const href = glp1EvaluationEntryHref(isPatient);

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Chargement…</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Link href={href} className={className}>
        {children}
      </Link>
      {showGuestLinks && !isPatient ? (
        <p className="text-center text-sm text-slate-500">
          <span className="text-slate-600">Connexion requise pour démarrer l&apos;évaluation.</span>
          <br />
          <Link
            href={glp1InscriptionHref(GLP1_EVALUATION_PATH)}
            className="font-medium text-[#1D9E75] hover:underline"
          >
            Créer un compte
          </Link>
          <span className="mx-2 text-slate-300">·</span>
          <Link href={href} className="font-medium text-[#1D9E75] hover:underline">
            Se connecter
          </Link>
        </p>
      ) : null}
    </div>
  );
}
