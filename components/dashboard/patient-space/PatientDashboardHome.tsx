"use client";

import type { ReactNode } from "react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MedsimLogo } from "@/components/MedsimLogo";
import { WeightProgressChartLazy } from "@/components/dashboard/patient-space/WeightProgressChartLazy";
import { OrderTrackingCompact } from "@/components/dashboard/patient-space/OrderTrackingCompact";
import { PatientFelixSidebar } from "@/components/dashboard/patient-space/PatientFelixSidebar";
import { PatientOnboardingWelcome } from "@/components/dashboard/patient-space/PatientOnboardingWelcome";
import type { AiCoachMessagePublic } from "@/lib/patient/ai-coach";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";
import { FetchErrorAlert } from "@/components/ui/FetchErrorAlert";
import { FETCH_ERROR_FALLBACK, userFacingErrorMessage } from "@/lib/client/fetch-json";
import { PATIENT_DASHBOARD_ROUTES } from "@/lib/patient/dashboard-routes";

type DashboardBanner = "PENDING_PAYMENT" | "IPS_REVIEW" | "ACTIVE" | "DELIVERED";

type QuestionnaireSnap = { id: string; status: string; updatedAt: string } | null;

type FulfillmentSummary = {
  id: string;
  medication: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  status: string;
};

type TrackingSnapshot = {
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  pdfUrl: string | null;
};

type DashboardPayload = {
  questionnaire: QuestionnaireSnap;
  fulfillment: FulfillmentSummary | null;
  tracking: TrackingSnapshot | null;
  program: WeightProgramPublic | null;
  checkIns: WeightCheckInPublic[];
  coachMessages: AiCoachMessagePublic[];
  unreadIps: number;
};

const ANNE_READ_KEY = "medsim-anne-read-ids";

function readAnneIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ANNE_READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markAnneRead(id: string) {
  const ids = readAnneIds();
  ids.add(id);
  localStorage.setItem(ANNE_READ_KEY, JSON.stringify([...ids]));
}

function weekNumberFromStart(startDate: string): number {
  const days = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(days / 7) + 1);
}

function deriveBanner(
  questionnaire: QuestionnaireSnap,
  fulfillment: FulfillmentSummary | null,
  tracking: TrackingSnapshot | null,
): DashboardBanner {
  if (fulfillment?.paymentStatus === "PENDING") return "PENDING_PAYMENT";
  if (
    questionnaire &&
    (questionnaire.status === "SUBMITTED" || questionnaire.status === "UNDER_REVIEW") &&
    fulfillment?.paymentStatus !== "PAID"
  ) {
    return "IPS_REVIEW";
  }
  if (
    tracking?.status === "SHIPPED" ||
    tracking?.status === "DELIVERED" ||
    fulfillment?.status === "DELIVERED"
  ) {
    return "DELIVERED";
  }
  return "ACTIVE";
}

function nextMondayAt9(): Date {
  const d = new Date();
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  const next = new Date(d);
  next.setDate(d.getDate() + daysUntilMonday);
  next.setHours(9, 0, 0, 0);
  if (day === 1 && d.getHours() < 9) {
    next.setDate(d.getDate());
  }
  return next;
}

function nextReminderDate(program: WeightProgramPublic): Date {
  if (program.checkInFreq === "WEEKLY") {
    return nextMondayAt9();
  }
  const sorted = [...program.recentCheckIns].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  const base = sorted[0] ? new Date(sorted[0].recordedAt) : new Date(program.startDate);
  const next = new Date(base);
  next.setDate(next.getDate() + 1);
  while (next.getTime() < Date.now()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function daysUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function fulfillmentLabel(status: string): string {
  const labels: Record<string, string> = {
    ISSUED: "Ordonnance émise",
    SENT_TO_PHARMACY: "Envoyée à la pharmacie",
    IN_PREPARATION: "En préparation",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };
  return labels[status] ?? status;
}

function deliveryIcon(status: string): string {
  if (status === "SHIPPED") return "📦";
  if (status === "IN_PREPARATION") return "🔄";
  if (status === "DELIVERED") return "🏠";
  if (status === "SENT_TO_PHARMACY") return "💊";
  return "📋";
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

type Props = {
  prenom: string;
};

function PatientDashboardHomeInner({ prenom }: Props) {
  const searchParams = useSearchParams();
  const showOnboarding = searchParams.get("paid") === "1";

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [anneReadIds, setAnneReadIds] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/patient/dashboard");
      const body = (await res.json().catch(() => ({}))) as DashboardPayload & { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? FETCH_ERROR_FALLBACK);
      }
      setData(body);
      setAnneReadIds(readAnneIds());
    } catch (err) {
      console.error("[PatientDashboardHome] load", err);
      setLoadError(userFacingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const program = data?.program ?? null;
  const checkIns = data?.checkIns ?? [];
  const coachMessages = data?.coachMessages ?? [];
  const fulfillment = data?.fulfillment ?? null;
  const tracking = data?.tracking ?? null;
  const questionnaire = data?.questionnaire ?? null;
  const unreadIps = data?.unreadIps ?? 0;

  const proactiveUnread = useMemo(() => {
    const proactive = [...coachMessages]
      .filter((m) => m.role === "assistant" && m.isProactive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = proactive[0];
    if (!latest || anneReadIds.has(latest.id)) return null;
    return latest;
  }, [coachMessages, anneReadIds]);

  const anneHasNewMessage = useMemo(() => {
    if (proactiveUnread) return true;
    const last = [...coachMessages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
    return last?.role === "assistant" && !anneReadIds.has(last.id);
  }, [coachMessages, anneReadIds, proactiveUnread]);

  const banner = deriveBanner(questionnaire, fulfillment, tracking);

  const chartCheckIns = useMemo(
    () =>
      [...checkIns]
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
        .slice(-8),
    [checkIns],
  );

  const nextReminder = program ? nextReminderDate(program) : null;
  const coachPreview = [...coachMessages].slice(-3);
  const fulfillmentStatus = tracking?.status ?? fulfillment?.status ?? "";

  const handleAnneRead = (id: string) => {
    markAnneRead(id);
    setAnneReadIds(readAnneIds());
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white lg:block">
        <Suspense fallback={<div className="h-full animate-pulse bg-slate-50" />}>
          <PatientFelixSidebar prenom={prenom} anneHasNewMessage={anneHasNewMessage} />
        </Suspense>
      </aside>

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 bg-white transition-transform lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Suspense fallback={<div className="h-full animate-pulse bg-slate-50" />}>
          <PatientFelixSidebar
            prenom={prenom}
            anneHasNewMessage={anneHasNewMessage}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </Suspense>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>
          <Link href="/" aria-label="MedSim">
            <MedsimLogo />
          </Link>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          {loadError ? (
            <FetchErrorAlert message={loadError} onRetry={() => void load()} />
          ) : null}

          {showOnboarding && !loading && data ? (
            <PatientOnboardingWelcome
              questionnaireStatus={
                questionnaire?.status as
                  | "SUBMITTED"
                  | "UNDER_REVIEW"
                  | "APPROVED"
                  | "PRESCRIPTION_ISSUED"
                  | null
              }
              fulfillment={fulfillment}
              checkIns={checkIns}
            />
          ) : null}

          {/* Bannière contextuelle */}
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <>
              {banner === "PENDING_PAYMENT" && fulfillment ? (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <p className="font-semibold text-orange-950">Votre ordonnance est prête ✓</p>
                  <p className="mt-1 text-sm text-orange-900/90">
                    Finalisez votre paiement pour recevoir votre médicament.
                  </p>
                  <Link
                    href={`/paiement?fulfillment=${fulfillment.id}`}
                    className="mt-4 inline-flex h-10 items-center rounded-full bg-orange-600 px-5 text-sm font-bold text-white hover:bg-orange-700"
                  >
                    Payer maintenant →
                  </Link>
                </div>
              ) : null}

              {banner === "IPS_REVIEW" ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <p className="font-semibold text-blue-950">Votre dossier est en cours d&apos;examen</p>
                  <p className="mt-1 text-sm text-blue-900/90">
                    Votre IPS vous répond sous 48 h ouvrables.
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
                  </div>
                </div>
              ) : null}

              {banner === "ACTIVE" && program ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-semibold text-emerald-950">
                    Semaine {weekNumberFromStart(program.startDate)} de votre programme 🌿
                  </p>
                  {nextReminder ? (
                    <p className="mt-1 text-sm text-emerald-900/90">
                      Prochain bilan hebdomadaire :{" "}
                      {nextReminder.toLocaleDateString("fr-CA", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  ) : null}
                </div>
              ) : banner === "ACTIVE" && !program ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-semibold text-emerald-950">
                    Bonjour{prenom ? ` ${prenom}` : ""} — bienvenue dans votre espace MedSim 🌿
                  </p>
                </div>
              ) : null}
            </>
          )}

          {/* Message Anne non lu */}
          {!loading && proactiveUnread ? (
            <section className="rounded-2xl border border-[#3EBD93]/30 bg-gradient-to-r from-[#F0F7F4] to-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A] text-lg font-bold text-white">
                    A
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">Anne a un message pour vous →</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {proactiveUnread.content.length > 120
                        ? `${proactiveUnread.content.slice(0, 120)}…`
                        : proactiveUnread.content}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/patient/coach-ia"
                  onClick={() => handleAnneRead(proactiveUnread.id)}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A] px-5 text-sm font-bold text-white hover:bg-[#163d2e]"
                >
                  Lire
                </Link>
              </div>
            </section>
          ) : null}

          {/* Stats 2x2 */}
          <section aria-label="Statistiques rapides">
            <div className="grid grid-cols-2 gap-3">
              {loading ? (
                <>
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </>
              ) : (
                <>
                  <StatCard
                    label="Poids actuel"
                    value={
                      program ? (
                        <span className="text-2xl">{program.currentWeight.toFixed(1)} kg</span>
                      ) : (
                        "—"
                      )
                    }
                    hint={
                      program && program.weightLost > 0 ? (
                        <span className="font-semibold text-emerald-600">
                          depuis le début : −{program.weightLost.toFixed(1).replace(".", ",")} kg ↓
                        </span>
                      ) : program ? (
                        `Objectif ${program.targetWeight.toFixed(1)} kg`
                      ) : undefined
                    }
                  />

                  <StatCard
                    label="Prochain rappel Anne"
                    value={
                      nextReminder
                        ? nextReminder.toLocaleDateString("fr-CA", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })
                        : "—"
                    }
                    hint={
                      nextReminder
                        ? `${nextReminder.toLocaleTimeString("fr-CA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} · dans ${daysUntil(nextReminder)} jour${daysUntil(nextReminder) > 1 ? "s" : ""}`
                        : "Bilan hebdomadaire"
                    }
                  />

                  <StatCard
                    label="Statut livraison"
                    value={
                      fulfillment || tracking ? (
                        <span className="inline-flex items-center gap-2 text-base">
                          <span aria-hidden>{deliveryIcon(fulfillmentStatus)}</span>
                          {fulfillmentLabel(fulfillmentStatus)}
                        </span>
                      ) : (
                        "—"
                      )
                    }
                  />

                  <StatCard
                    label="Messages non lus"
                    value={
                      unreadIps > 0 ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                            {unreadIps}
                          </span>
                        </span>
                      ) : (
                        "0"
                      )
                    }
                    action={
                      <Link
                        href={PATIENT_DASHBOARD_ROUTES.clavardage}
                        className="text-xs font-semibold text-[#1D4D3A] hover:underline"
                      >
                        Voir mes messages →
                      </Link>
                    }
                  />
                </>
              )}
            </div>
          </section>

          {/* Graphique */}
          <section
            id="mon-evolution"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">Mon évolution</h2>
              <Link
                href={`${PATIENT_DASHBOARD_ROUTES.poids}?tab=progression`}
                className="text-sm font-semibold text-[#1D4D3A] hover:underline"
              >
                Voir tout →
              </Link>
            </div>
            {loading ? (
              <Skeleton className="mt-4 h-48" />
            ) : chartCheckIns.length < 2 ? (
              <div className="mt-4 flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-[#FAFAF8] text-center">
                <p className="text-sm text-slate-500">
                  Enregistrez votre premier poids avec Anne →
                </p>
                <Link
                  href="/dashboard/patient/coach-ia"
                  className="mt-3 inline-flex h-10 items-center rounded-full bg-[#1D4D3A] px-5 text-sm font-bold text-white hover:bg-[#163d2e]"
                >
                  Ouvrir le coach
                </Link>
              </div>
            ) : (
              <div className="mt-4 min-w-0">
                <WeightProgressChartLazy
                  checkIns={chartCheckIns}
                  targetWeight={program?.targetWeight}
                  startWeight={program?.startWeight}
                />
              </div>
            )}
          </section>

          {/* Aperçu Anne */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">Ma conversation avec Anne</h2>
              <Link
                href="/dashboard/patient/coach-ia"
                className="text-sm font-semibold text-[#1D4D3A] hover:underline"
              >
                Continuer avec Anne →
              </Link>
            </div>
            {loading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="ml-auto h-12 w-2/3" />
              </div>
            ) : coachPreview.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {coachPreview.map((m) => (
                  <li
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" ? (
                      <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A] text-xs font-bold text-white">
                        A
                      </span>
                    ) : null}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "rounded-tr-sm bg-[#1D4D3A] text-white"
                          : "rounded-tl-sm border border-[#3EBD93]/20 bg-[#F0F7F4] text-[#1A1A2E]"
                      }`}
                    >
                      {m.content.length > 160 ? `${m.content.slice(0, 160)}…` : m.content}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Ouvrez le coach pour votre premier échange avec Anne.
              </p>
            )}
          </section>

          {/* Ordonnance */}
          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="h-20" />
            </section>
          ) : fulfillment ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Mon ordonnance</h2>
              <p className="mt-1 text-sm text-slate-500">{fulfillment.medication}</p>
              <div className="mt-4">
                <OrderTrackingCompact fulfillmentId={fulfillment.id} />
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export function PatientDashboardHome({ prenom }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1D4D3A] border-t-transparent" />
        </div>
      }
    >
      <PatientDashboardHomeInner prenom={prenom} />
    </Suspense>
  );
}

function StatCard({
  label,
  value,
  hint,
  action,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-bold leading-tight text-slate-900">{value}</p>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
