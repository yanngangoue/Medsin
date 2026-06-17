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
  if (day === 1 && d.getHours() < 9) next.setDate(d.getDate());
  return next;
}

function nextReminderDate(program: WeightProgramPublic): Date {
  if (program.checkInFreq === "WEEKLY") return nextMondayAt9();
  const sorted = [...program.recentCheckIns].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  const base = sorted[0] ? new Date(sorted[0].recordedAt) : new Date(program.startDate);
  const next = new Date(base);
  next.setDate(next.getDate() + 1);
  while (next.getTime() < Date.now()) next.setDate(next.getDate() + 1);
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

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

function delay(n: number) {
  return { style: { animationDelay: `${n}ms` } };
}

/* ── Icônes SVG inline ─────────────────────────────────────────── */
function IconWeight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d="M1 3h13v13H1zM14 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── Barre de progression du parcours ────────────────────────── */
type JourneyStep = { label: string; done: boolean; active: boolean };

function JourneyStrip({ steps }: { steps: JourneyStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;
  const progressPct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Votre parcours</p>
        <p className="text-xs font-semibold text-[#1D4D3A]">{doneCount}/{steps.length} étapes</p>
      </div>
      {/* Barre de progression */}
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="dash-progress-bar h-full rounded-full bg-gradient-to-r from-[#3EBD93] to-[#1D4D3A]"
          style={{ ["--progress-width" as string]: `${progressPct}%`, width: `${progressPct}%` }}
        />
      </div>
      {/* Étapes */}
      <div className="flex items-start justify-between gap-1 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step.done
                  ? "bg-[#1D4D3A] text-white"
                  : step.active
                    ? "border-2 border-[#3EBD93] bg-white text-[#1D4D3A]"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {step.done ? (
                <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <p
              className={`text-center text-[9px] font-medium leading-tight ${
                step.done ? "text-[#1D4D3A]" : step.active ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Carte statistique ───────────────────────────────────────── */
function StatCard({
  label,
  value,
  hint,
  action,
  icon,
  accent = "slate",
  delay: d = 0,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  icon: ReactNode;
  accent?: "green" | "blue" | "orange" | "slate";
  delay?: number;
}) {
  const accentCls = {
    green: "bg-[#F0F7F4] text-[#1D4D3A]",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    slate: "bg-slate-100 text-slate-600",
  }[accent];

  return (
    <div
      className="dash-enter rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
      style={{ animationDelay: `${d}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`rounded-xl p-2 ${accentCls}`}>{icon}</div>
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-0.5 font-bold leading-tight text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/* ── Hero bannière contextuelle ─────────────────────────────── */
function HeroBanner({
  banner,
  prenom,
  program,
  fulfillment,
  nextReminder,
}: {
  banner: DashboardBanner;
  prenom: string;
  program: WeightProgramPublic | null;
  fulfillment: FulfillmentSummary | null;
  nextReminder: Date | null;
}) {
  const greeting = prenom ? `Bonjour, ${prenom}` : "Bonjour";

  if (banner === "PENDING_PAYMENT" && fulfillment) {
    return (
      <div className="dash-enter relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white" />
        </div>
        <p className="relative text-sm font-semibold text-orange-100">{greeting}</p>
        <p className="relative mt-1 font-display text-2xl font-bold leading-snug tracking-tight">
          Votre ordonnance est prête !
        </p>
        <p className="relative mt-1 text-sm text-orange-100">
          {fulfillment.medication} · Finalisez votre paiement pour démarrer votre programme.
        </p>
        <Link
          href={`/paiement?fulfillment=${fulfillment.id}`}
          className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-sm hover:shadow-md transition-shadow"
        >
          Payer maintenant <IconArrow />
        </Link>
      </div>
    );
  }

  if (banner === "IPS_REVIEW") {
    return (
      <div className="dash-enter relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <p className="relative text-sm font-semibold text-blue-100">{greeting}</p>
        <p className="relative mt-1 font-display text-2xl font-bold tracking-tight">Dossier en cours d&apos;examen</p>
        <p className="relative mt-1 text-sm text-blue-100">
          Votre IPS analyse votre questionnaire — réponse sous 48 h ouvrables.
        </p>
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-blue-500/50">
          <div className="dash-progress-bar h-full w-2/3 rounded-full bg-white/80" />
        </div>
      </div>
    );
  }

  if (banner === "ACTIVE" && program) {
    const week = weekNumberFromStart(program.startDate);
    const lost = program.weightLost;
    return (
      <div className="dash-enter relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D4D3A] to-[#163d2e] p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white" />
          <div className="absolute -bottom-12 left-8 h-36 w-36 rounded-full bg-white" />
        </div>
        <p className="relative text-sm font-semibold text-[#3EBD93]">{greeting}</p>
        <p className="relative mt-1 font-display text-2xl font-bold leading-snug tracking-tight">
          Semaine {week} de votre programme 🌿
        </p>
        {lost > 0 ? (
          <p className="relative mt-1 text-sm text-emerald-200">
            Vous avez perdu{" "}
            <span className="font-bold text-white">{lost.toFixed(1).replace(".", ",")} kg</span>{" "}
            depuis le début — continuez comme ça !
          </p>
        ) : (
          <p className="relative mt-1 text-sm text-emerald-200">
            Objectif : {program.targetWeight.toFixed(1)} kg · Vous y êtes presque.
          </p>
        )}
        {nextReminder ? (
          <p className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <span>📅</span>
            Prochain bilan :{" "}
            {nextReminder.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        ) : null}
      </div>
    );
  }

  /* État initial / pas encore de programme */
  return (
    <div className="dash-enter relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D4D3A] to-[#163d2e] p-6 text-white shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white" />
      </div>
      <p className="relative text-sm font-semibold text-[#3EBD93]">{greeting}</p>
      <p className="relative mt-1 font-display text-2xl font-bold tracking-tight">Bienvenue dans votre espace MedSim 🌿</p>
      <p className="relative mt-1 text-sm text-emerald-200">
        Votre programme de gestion du poids démarre ici.
      </p>
      <Link
        href="/dashboard/patient/coach-ia"
        className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
      >
        Parler à Anne <IconArrow />
      </Link>
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────────── */
type Props = { prenom: string };

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
      if (!res.ok) throw new Error(body.error ?? FETCH_ERROR_FALLBACK);
      setData(body);
      setAnneReadIds(readAnneIds());
    } catch (err) {
      setLoadError(userFacingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const program = data?.program ?? null;
  const checkIns = useMemo(() => data?.checkIns ?? [], [data]);
  const coachMessages = useMemo(() => data?.coachMessages ?? [], [data]);
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

  /* Étapes du parcours déduites de l'état */
  const journeySteps: JourneyStep[] = useMemo(() => {
    const hasQuestionnaire = !!questionnaire;
    const ipsReviewed =
      questionnaire?.status === "PRESCRIPTION_ISSUED" ||
      questionnaire?.status === "APPROVED" ||
      !!fulfillment;
    const hasFulfillment = !!fulfillment;
    const isPaid = fulfillment?.paymentStatus === "PAID";
    const isActive = isPaid && !!program;

    return [
      { label: "Inscription", done: true, active: false },
      { label: "Questionnaire", done: hasQuestionnaire, active: !hasQuestionnaire },
      { label: "Examen IPS", done: ipsReviewed, active: hasQuestionnaire && !ipsReviewed },
      { label: "Ordonnance", done: hasFulfillment, active: ipsReviewed && !hasFulfillment },
      { label: "Paiement", done: isPaid, active: hasFulfillment && !isPaid },
      { label: "Suivi actif", done: isActive, active: isPaid && !isActive },
    ];
  }, [questionnaire, fulfillment, program]);

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white lg:block">
        <Suspense fallback={<div className="h-full animate-pulse bg-slate-50" />}>
          <PatientFelixSidebar prenom={prenom} anneHasNewMessage={anneHasNewMessage} />
        </Suspense>
      </aside>

      {/* Overlay mobile */}
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      {/* Sidebar mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 bg-white transition-transform duration-300 lg:hidden ${
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

      {/* Contenu principal */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Header mobile */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label="Ouvrir le menu"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" />
            </svg>
          </button>
          <Link href="/" aria-label="MedSim"><MedsimLogo /></Link>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-6 sm:px-6 sm:py-8 [&_h2]:font-display [&_h2]:tracking-tight">
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

          {/* Hero */}
          {loading ? (
            <Skeleton className="h-36" />
          ) : (
            <HeroBanner
              banner={banner}
              prenom={prenom}
              program={program}
              fulfillment={fulfillment}
              nextReminder={nextReminder}
            />
          )}

          {/* Barre de progression du parcours */}
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="dash-enter" {...delay(100)}>
              <JourneyStrip steps={journeySteps} />
            </div>
          )}

          {/* Message Anne non lu */}
          {!loading && proactiveUnread ? (
            <section
              className="dash-enter rounded-2xl border border-[#3EBD93]/30 bg-gradient-to-r from-[#F0F7F4] to-white p-5 shadow-sm"
              {...delay(150)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A] text-lg font-bold text-white">
                    A
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#3EBD93]" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">Anne a un message pour vous</p>
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
                  className="inline-flex h-10 shrink-0 items-center gap-2 justify-center rounded-full bg-[#1D4D3A] px-5 text-sm font-bold text-white hover:bg-[#163d2e] transition-colors"
                >
                  Lire <IconArrow />
                </Link>
              </div>
            </section>
          ) : null}

          {/* 4 cartes de stats */}
          <section aria-label="Statistiques rapides">
            <div className="grid grid-cols-2 gap-3">
              {loading ? (
                <>
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </>
              ) : (
                <>
                  <StatCard
                    label="Poids actuel"
                    icon={<IconWeight />}
                    accent="green"
                    delay={200}
                    value={
                      program ? (
                        <span className="dash-count text-2xl">{program.currentWeight.toFixed(1)} kg</span>
                      ) : "—"
                    }
                    hint={
                      program && program.weightLost > 0 ? (
                        <span className="font-semibold text-emerald-600">
                          −{program.weightLost.toFixed(1).replace(".", ",")} kg depuis le début
                        </span>
                      ) : program ? (
                        `Objectif : ${program.targetWeight.toFixed(1)} kg`
                      ) : undefined
                    }
                  />

                  <StatCard
                    label="Prochain rappel"
                    icon={<IconCalendar />}
                    accent="blue"
                    delay={260}
                    value={
                      nextReminder
                        ? nextReminder.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric", month: "short" })
                        : "—"
                    }
                    hint={
                      nextReminder
                        ? `Dans ${daysUntil(nextReminder)} jour${daysUntil(nextReminder) > 1 ? "s" : ""}`
                        : "Bilan hebdomadaire"
                    }
                  />

                  <StatCard
                    label="Livraison"
                    icon={<IconTruck />}
                    accent={fulfillmentStatus === "DELIVERED" ? "green" : fulfillmentStatus === "SHIPPED" ? "blue" : "slate"}
                    delay={320}
                    value={
                      fulfillment || tracking
                        ? fulfillmentLabel(fulfillmentStatus)
                        : "—"
                    }
                  />

                  <StatCard
                    label="Messages IPS"
                    icon={<IconMessage />}
                    accent={unreadIps > 0 ? "orange" : "slate"}
                    delay={380}
                    value={
                      unreadIps > 0 ? (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                          {unreadIps}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )
                    }
                    action={
                      <Link
                        href={PATIENT_DASHBOARD_ROUTES.clavardage}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4D3A] hover:underline"
                      >
                        Voir mes messages <IconArrow />
                      </Link>
                    }
                  />
                </>
              )}
            </div>
          </section>

          {/* Graphique évolution */}
          <section
            id="mon-evolution"
            className="dash-enter rounded-2xl border border-slate-200 bg-white shadow-sm"
            {...delay(440)}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">Mon évolution du poids</h2>
              <Link
                href={`${PATIENT_DASHBOARD_ROUTES.poids}?tab=progression`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D4D3A] hover:underline"
              >
                Voir tout <IconArrow />
              </Link>
            </div>
            <div className="p-5">
              {loading ? (
                <Skeleton className="h-48" />
              ) : chartCheckIns.length < 2 ? (
                <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-[#FAFAF8] text-center">
                  <svg viewBox="0 0 48 48" fill="none" className="mb-3 h-10 w-10 text-slate-300">
                    <path d="M6 38l10-12 8 8 10-16 8 10" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-medium text-slate-500">
                    Aucune donnée de poids pour le moment
                  </p>
                  <Link
                    href="/dashboard/patient/coach-ia"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1D4D3A] px-4 py-2 text-sm font-bold text-white hover:bg-[#163d2e] transition-colors"
                  >
                    Enregistrer avec Anne <IconArrow />
                  </Link>
                </div>
              ) : (
                <WeightProgressChartLazy
                  checkIns={chartCheckIns}
                  targetWeight={program?.targetWeight}
                  startWeight={program?.startWeight}
                />
              )}
            </div>
          </section>

          {/* Aperçu conversation Anne */}
          <section
            className="dash-enter rounded-2xl border border-slate-200 bg-white shadow-sm"
            {...delay(500)}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A] text-sm font-bold text-white">
                  A
                  {anneHasNewMessage && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#3EBD93]" />
                  )}
                </span>
                <h2 className="text-base font-bold text-slate-900">Anne — Coach IA</h2>
              </div>
              <Link
                href="/dashboard/patient/coach-ia"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D4D3A] hover:underline"
              >
                Continuer <IconArrow />
              </Link>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="ml-auto h-10 w-2/3" />
                </div>
              ) : coachPreview.length > 0 ? (
                <ul className="space-y-3">
                  {coachPreview.map((m) => (
                    <li key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "assistant" ? (
                        <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A] text-[10px] font-bold text-white">
                          A
                        </span>
                      ) : null}
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
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
                <div className="flex flex-col items-center py-4 text-center">
                  <p className="text-sm text-slate-500">
                    Commencez votre premier échange avec Anne.
                  </p>
                  <Link
                    href="/dashboard/patient/coach-ia"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#1D4D3A] px-4 py-2 text-sm font-semibold text-[#1D4D3A] hover:bg-[#F0F7F4] transition-colors"
                  >
                    Démarrer la conversation <IconArrow />
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Ordonnance + suivi livraison */}
          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="h-20" />
            </section>
          ) : fulfillment ? (
            <section
              className="dash-enter rounded-2xl border border-slate-200 bg-white shadow-sm"
              {...delay(560)}
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">Mon ordonnance</h2>
                <p className="text-sm text-slate-500">{fulfillment.medication}</p>
              </div>
              <div className="p-5">
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
