"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { objectifLabel } from "@/lib/questionnaire-labels";
import { parseQuestionnaireResponse } from "@/lib/questionnaire-api";
import { isPublicSiteMode } from "@/lib/is-public-site";

export default function ConfirmationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [objectif, setObjectif] = useState("—");
  const [imc, setImc] = useState("—");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    if (status === "loading" && !isPublicSiteMode()) return;
    if (!isPublicSiteMode() && status === "unauthenticated") {
      router.replace("/connexion");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/questionnaire");
      if (cancelled || !res.ok) return;
      const q = parseQuestionnaireResponse(await res.json());
      if (!q) return;
      setObjectif(objectifLabel(q.objectif));
      setImc(String(q.imc));
      const submitted = q.submittedAt ? new Date(q.submittedAt) : new Date();
      setDateStr(submitted.toLocaleDateString("fr-CA", { dateStyle: "long" }));
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const prenom = session?.user?.prenom ?? session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="mx-auto flex max-w-[480px] flex-1 items-center justify-center py-16 text-sm text-slate-500">
        Chargement…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-4 py-12 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center">
        <svg viewBox="0 0 48 48" className="h-20 w-20" aria-hidden>
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="#1D9E75"
            strokeWidth="2"
            className="medsim-check-circle"
          />
          <path
            d="M14 24l7 7 13-14"
            fill="none"
            stroke="#1D9E75"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="medsim-check-mark"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-slate-900">
        Dossier reçu{prenom ? `, ${prenom}` : ""} !
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Un médecin examine votre dossier. Vous recevrez une réponse sous 24h.
      </p>

      <div className="mt-10 w-full rounded-2xl bg-slate-100 p-6 text-left text-sm text-slate-800">
        <ul className="space-y-3">
          <li>
            <span className="text-slate-500">Objectif :</span>{" "}
            <span className="font-medium">{objectif}</span>
          </li>
          <li>
            <span className="text-slate-500">IMC :</span> <span className="font-medium">{imc}</span>
          </li>
          <li>
            <span className="text-slate-500">Date de soumission :</span>{" "}
            <span className="font-medium">{dateStr}</span>
          </li>
        </ul>
      </div>

      <Link
        href="/"
        className="mt-10 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-xl bg-[#1D9E75] text-sm font-semibold text-white hover:bg-[#188763]"
      >
        Accéder à mon espace
      </Link>

      {email ? (
        <p className="mt-8 text-[12px] text-slate-500">Une confirmation a été envoyée à {email}</p>
      ) : null}
    </div>
  );
}
