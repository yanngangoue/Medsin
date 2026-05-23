"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { NUTRI_PLUS_PLAN_BUILDER } from "@/lib/patient/nutri-plus-content";
import {
  DEFAULT_MODULE_IDS,
  followupById,
  NUTRI_DAY_FOLLOWUPS,
  NUTRI_PLAN_MODULES,
  type NutriDayFollowup,
  type NutriPlanModule,
} from "@/lib/patient/nutri-plus-plan-options";
import { NUTRI_PLUS_QUESTIONNAIRE_PATH } from "@/lib/patient/nutri-plus-routes";

const TRACKING_COUNTS = [3, 5, 7] as const;
type TrackingCount = (typeof TRACKING_COUNTS)[number];

const WEEKDAYS = [
  { id: "lun", label: "Lun", full: "Lundi" },
  { id: "mar", label: "Mar", full: "Mardi" },
  { id: "mer", label: "Mer", full: "Mercredi" },
  { id: "jeu", label: "Jeu", full: "Jeudi" },
  { id: "ven", label: "Ven", full: "Vendredi" },
  { id: "sam", label: "Sam", full: "Samedi" },
  { id: "dim", label: "Dim", full: "Dimanche" },
] as const;

const DEFAULT_DAYS: Record<TrackingCount, readonly string[]> = {
  3: ["lun", "mer", "ven"],
  5: ["lun", "mar", "mer", "jeu", "ven"],
  7: ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"],
};

const dayById = Object.fromEntries(WEEKDAYS.map((d) => [d.id, d])) as Record<
  string,
  (typeof WEEKDAYS)[number]
>;

const PLAN_CALLBACK = "/onboarding/nutri-plus?plan=1#configurer-mon-suivi";

const copy = NUTRI_PLUS_PLAN_BUILDER;

const TEXT = "#1A2E24";
const TEXT_MUTED = "#3D5C4A";
const ACCENT = "#1D9E75";
const BG_SOFT = "#E8F5F0";

export function NutriPlusCreatePlan() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [isOpen, setIsOpen] = useState(false);
  const [trackingCount, setTrackingCount] = useState<TrackingCount>(5);
  const [trackingDays, setTrackingDays] = useState<string[]>([...DEFAULT_DAYS[5]]);
  const [selectedModules, setSelectedModules] = useState<string[]>([...DEFAULT_MODULE_IDS]);
  const [dayFollowups, setDayFollowups] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("plan") === "1" || window.location.hash === "#configurer-mon-suivi") {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    setTrackingDays([...DEFAULT_DAYS[trackingCount]]);
    setDayFollowups({});
  }, [trackingCount]);

  useEffect(() => {
    setDayFollowups((prev) => {
      const next: Record<string, string> = {};
      for (const dayId of trackingDays) {
        if (prev[dayId]) next[dayId] = prev[dayId];
      }
      return next;
    });
  }, [trackingDays]);

  const toggleModule = useCallback((id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }, []);

  const openPlan = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      document.getElementById("configurer-mon-suivi")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const toggleTrackingDay = useCallback(
    (id: string) => {
      setTrackingDays((prev) => {
        if (prev.includes(id)) {
          if (prev.length <= 1) return prev;
          return prev.filter((d) => d !== id);
        }
        if (prev.length >= trackingCount) return prev;
        return [...prev, id];
      });
    },
    [trackingCount],
  );

  const sortedSlots = useMemo(() => {
    const order = WEEKDAYS.map((d) => d.id);
    return [...trackingDays].sort(
      (a, b) =>
        order.indexOf(a as (typeof WEEKDAYS)[number]["id"]) -
        order.indexOf(b as (typeof WEEKDAYS)[number]["id"]),
    );
  }, [trackingDays]);

  const planLines = useMemo(
    () =>
      sortedSlots.map((dayId) => {
        const day = dayById[dayId];
        const followupId = dayFollowups[dayId];
        const followup = followupId ? followupById[followupId] : undefined;
        return { dayId, dayLabel: day?.full ?? dayId, followup };
      }),
    [sortedSlots, dayFollowups],
  );

  const activeModules = useMemo(
    () => NUTRI_PLAN_MODULES.filter((m) => selectedModules.includes(m.id)),
    [selectedModules],
  );

  const hasMinModules = selectedModules.length >= 2;
  const allDaysConfigured =
    planLines.length === trackingCount && planLines.every((l) => l.followup);
  const canStart = hasMinModules && allDaysConfigured;
  const filled = planLines.filter((l) => l.followup).length;

  const selectFollowupForDay = (dayId: string, followupId: string) => {
    setDayFollowups((prev) => ({ ...prev, [dayId]: followupId }));
  };

  return (
    <section
      id="configurer-mon-suivi"
      className="border-t border-[#C8E6D9]/30 bg-[#F0F7F4] py-14 sm:py-16"
      aria-labelledby="nutri-plan-title"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2
          id="nutri-plan-title"
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: TEXT }}
        >
          {copy.sectionTitle}
        </h2>
        <p
          className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed sm:text-[15px]"
          style={{ color: TEXT_MUTED }}
        >
          {copy.sectionLead}
        </p>

        {!isOpen ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={openPlan}
              className="w-full max-w-md rounded-xl bg-[#1D9E75] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[#178a66] sm:text-lg"
            >
              {copy.openCta}
            </button>
          </div>
        ) : (
          <div className="mt-8">
            {status === "loading" ? (
              <p className="text-center text-sm" style={{ color: TEXT_MUTED }}>
                Chargement…
              </p>
            ) : !isAuthenticated ? (
              <div
                className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 sm:p-8"
                style={{ borderColor: "rgb(200 230 217 / 0.4)" }}
              >
                <p className="text-sm font-semibold" style={{ color: TEXT }}>
                  Connectez-vous pour configurer votre suivi
                </p>
                <p className="mt-2 text-sm" style={{ color: TEXT_MUTED }}>
                  Créez un compte ou connectez-vous pour choisir vos jours, modules et objectifs Nutri+.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href={`/auth/connexion?callbackUrl=${encodeURIComponent(PLAN_CALLBACK)}`}
                    className="inline-flex justify-center rounded-md bg-[var(--teal-900)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href={`/auth/inscription?service=nutri-plus&callbackUrl=${encodeURIComponent(PLAN_CALLBACK)}`}
                    className="inline-flex justify-center rounded-md px-6 py-2.5 text-sm font-semibold text-white transition"
                    style={{ backgroundColor: ACCENT }}
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
                <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#C8E6D9]/25 sm:p-8">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>
                      {copy.trackingLabel}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {TRACKING_COUNTS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setTrackingCount(n)}
                          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                            trackingCount === n
                              ? "text-white shadow-md"
                              : "ring-1 hover:bg-white"
                          }`}
                          style={
                            trackingCount === n
                              ? { backgroundColor: ACCENT }
                              : { backgroundColor: BG_SOFT, color: TEXT_MUTED, borderColor: "rgb(200 230 217 / 0.5)" }
                          }
                        >
                          {n} jours
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>
                      {copy.daysLabel} ({trackingDays.length}/{trackingCount})
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => {
                        const active = trackingDays.includes(day.id);
                        const disabled = !active && trackingDays.length >= trackingCount;
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleTrackingDay(day.id)}
                            disabled={disabled}
                            className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold sm:h-12 sm:w-12 ${
                              active
                                ? "bg-[var(--teal-900)] text-white"
                                : disabled
                                  ? "cursor-not-allowed bg-stone-100 text-stone-400"
                                  : "ring-1"
                            }`}
                            style={
                              !active && !disabled
                                ? { backgroundColor: BG_SOFT, color: TEXT_MUTED }
                                : undefined
                            }
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-6">
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>
                      {copy.modulesTitle}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: TEXT_MUTED }}>
                      {copy.modulesHint}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {NUTRI_PLAN_MODULES.map((mod) => (
                        <ModuleCard
                          key={mod.id}
                          module={mod}
                          active={selectedModules.includes(mod.id)}
                          onToggle={() => toggleModule(mod.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 border-t border-stone-100 pt-6">
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>
                      {copy.followupTitle}
                    </p>
                    {sortedSlots.map((dayId, index) => (
                      <DayFollowupPicker
                        key={dayId}
                        dayLabel={dayById[dayId]?.full ?? dayId}
                        slotIndex={index + 1}
                        followups={NUTRI_DAY_FOLLOWUPS}
                        selectedId={dayFollowups[dayId]}
                        onSelect={(id) => selectFollowupForDay(dayId, id)}
                      />
                    ))}
                  </div>
                </div>

                <PlanSidebar
                  planLines={planLines}
                  activeModules={activeModules}
                  trackingCount={trackingCount}
                  canStart={canStart}
                  filled={filled}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ModuleCard({
  module,
  active,
  onToggle,
}: {
  module: NutriPlanModule;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex gap-3 rounded-xl p-4 text-left ring-2 transition ${
        active ? "bg-[#F8FCFA] ring-[#1D9E75] shadow-sm" : "bg-[#F0F7F4]/80 ring-transparent hover:ring-[#1D9E75]/30"
      }`}
    >
      <FollowupIcon type={module.id} active={active} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1A2E24]">{module.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#3D5C4A]">{module.detail}</p>
      </div>
    </button>
  );
}

function DayFollowupPicker({
  dayLabel,
  slotIndex,
  followups,
  selectedId,
  onSelect,
}: {
  dayLabel: string;
  slotIndex: number;
  followups: readonly NutriDayFollowup[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[#C8E6D9]/30 bg-[#E8F5F0]/60 p-4">
      <p className="mb-3 text-sm font-semibold text-[#1A2E24]">
        Jour {slotIndex} — {dayLabel}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {followups.map((f) => {
          const picked = selectedId === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              className={`flex flex-col items-center rounded-xl p-3 text-center ring-2 transition ${
                picked ? "bg-white ring-[#1D9E75] shadow-md" : "bg-white ring-transparent hover:ring-[#1D9E75]/40"
              }`}
            >
              <FollowupIcon type={f.id} active={picked} compact />
              <p className="mt-2 text-[11px] font-semibold leading-tight text-[#1A2E24]">{f.label}</p>
              <p className="mt-1 text-[10px] leading-snug text-[#3D5C4A]">{f.detail}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FollowupIcon({
  type,
  active,
  compact,
}: {
  type: string;
  active: boolean;
  compact?: boolean;
}) {
  const color = active ? "#1D9E75" : "#94a3b8";
  const size = compact ? 36 : 44;

  const paths: Record<string, ReactNode> = {
    journal: (
      <>
        <rect x="6" y="6" width="24" height="32" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M12 14h16M12 22h12M12 30h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    menus: (
      <>
        <path d="M8 28 L20 8 L32 28 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <path d="M14 22h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    "suivi-pro": (
      <>
        <circle cx="20" cy="20" r="12" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M20 14v6l4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    menu: (
      <>
        <ellipse cx="20" cy="26" rx="14" ry="4" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M8 26c0-12 6-18 12-18s12 6 12 18" stroke={color} strokeWidth="1.5" fill="none" />
      </>
    ),
    checkin: (
      <>
        <path d="M10 20h20M20 10v20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="14" stroke={color} strokeWidth="1.5" fill="none" />
      </>
    ),
    consolidation: (
      <>
        <path d="M8 24 L20 8 L32 24" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <path d="M14 20h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className="shrink-0">
      {paths[type] ?? paths.journal}
    </svg>
  );
}

function PlanSidebar({
  planLines,
  activeModules,
  trackingCount,
  canStart,
  filled,
}: {
  planLines: { dayId: string; dayLabel: string; followup?: NutriDayFollowup }[];
  activeModules: readonly NutriPlanModule[];
  trackingCount: number;
  canStart: boolean;
  filled: number;
}) {
  return (
    <aside className="sticky top-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-[#C8E6D9]/25 lg:p-6">
      <h3 className="text-lg font-bold text-[#1A2E24]">{copy.sidebarTitle}</h3>
      <p className="mt-1 text-xs text-[#3D5C4A]">{copy.sidebarSubtitle}</p>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-stone-500">{copy.modulesLine}</p>
      <ul className="mt-2 space-y-1">
        {activeModules.map((m) => (
          <li key={m.id} className="flex items-center gap-2 text-sm text-[#1A2E24]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D9E75]" aria-hidden />
            {m.label}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-stone-500">Suivi par jour</p>
      <ul className="mt-2 max-h-[280px] space-y-2 overflow-y-auto">
        {planLines.length === 0 ? (
          <li className="text-sm text-stone-500">Sélectionnez vos jours de suivi.</li>
        ) : (
          planLines.map((line) => (
            <li
              key={line.dayId}
              className="flex justify-between gap-2 border-b border-stone-100 pb-2 text-sm last:border-0"
            >
              <span className="text-[#3D5C4A]">{line.dayLabel}</span>
              <span className="text-right font-medium text-[#1A2E24]">{line.followup?.label ?? "—"}</span>
            </li>
          ))
        )}
      </ul>

      <div className="mt-4 border-t border-stone-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-[#3D5C4A]">{copy.trackingLine}</span>
          <span className="font-semibold text-[#1A2E24]">
            {planLines.length} jour{planLines.length > 1 ? "s" : ""}/sem.
          </span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-[#3D5C4A]">Modules</span>
          <span className="font-semibold text-[#1A2E24]">{activeModules.length}</span>
        </div>
      </div>

      <Link
        href={NUTRI_PLUS_QUESTIONNAIRE_PATH}
        className={`mt-4 flex w-full items-center justify-center rounded-md py-3 text-sm font-semibold text-white transition ${
          canStart ? "bg-[var(--teal-900)] hover:bg-[var(--teal)]" : "pointer-events-none opacity-50"
        }`}
        aria-disabled={!canStart}
      >
        {copy.startCta}
      </Link>

      {!canStart && planLines.length > 0 && (
        <p className="mt-2 text-center text-xs text-[#3D5C4A]">
          {copy.completeHint} ({filled}/{trackingCount}).
        </p>
      )}
    </aside>
  );
}
