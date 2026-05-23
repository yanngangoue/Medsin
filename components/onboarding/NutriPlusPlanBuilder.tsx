"use client";

import Link from "next/link";
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

const copy = NUTRI_PLUS_PLAN_BUILDER;

/** @deprecated Utiliser NutriPlusCreatePlan — conservé pour imports existants */
export function NutriPlusPlanBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [trackingCount, setTrackingCount] = useState<TrackingCount>(5);
  const [trackingDays, setTrackingDays] = useState<string[]>([...DEFAULT_DAYS[5]]);
  const [selectedModules, setSelectedModules] = useState<string[]>([...DEFAULT_MODULE_IDS]);
  const [dayFollowups, setDayFollowups] = useState<Record<string, string>>({});

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
      document.getElementById("configurer-nutri")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closePlan = () => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      document.getElementById("configurer-nutri")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      id="configurer-nutri"
      className="border-t border-[#C8E6D9]/30 bg-[#F0F7F4] py-14 sm:py-16"
      aria-labelledby="nutri-plan-title"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2
          id="nutri-plan-title"
          className="text-center text-2xl font-bold tracking-tight text-[#1A2E24] sm:text-3xl"
        >
          {copy.sectionTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-[#3D5C4A] sm:text-[15px]">
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
            <div className="mb-6 flex justify-start">
              <button
                type="button"
                onClick={closePlan}
                className="inline-flex items-center gap-2 rounded-full border border-[#C8E6D9] bg-white px-4 py-2 text-sm font-semibold text-[var(--teal-900)] shadow-sm transition hover:border-[#1D9E75] hover:bg-[#F8FCFA]"
              >
                <span aria-hidden>←</span>
                Revenir à l&apos;introduction
              </button>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
                <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#C8E6D9]/40 sm:p-8">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{copy.trackingLabel}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {TRACKING_COUNTS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setTrackingCount(n)}
                          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                            trackingCount === n
                              ? "bg-[#1D9E75] text-white shadow-md shadow-[#1D9E75]/25"
                              : "bg-[#E8F5F0] text-[#3D5C4A] ring-1 ring-[#C8E6D9] hover:bg-white"
                          }`}
                        >
                          {n} jours
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
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
                                ? "bg-[var(--teal-900)] text-white shadow-sm"
                                : disabled
                                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                  : "bg-[#F5F0EB] text-slate-700 ring-1 ring-[#C8E6D9] hover:ring-[#1D9E75]/40"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-sm font-semibold text-slate-900">{copy.modulesTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{copy.modulesHint}</p>
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

                  <div className="space-y-6 border-t border-slate-100 pt-6">
                    <p className="text-sm font-semibold text-slate-900">{copy.followupTitle}</p>
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
        active
          ? "bg-[#F8FCFA] ring-[#1D9E75] shadow-sm"
          : "bg-[#F5F0EB]/60 ring-transparent hover:ring-[#1D9E75]/30"
      }`}
    >
      <FollowupIcon type={module.id} active={active} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{module.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{module.detail}</p>
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
    <div className="rounded-xl border border-[#C8E6D9]/40 bg-[#F5F0EB]/50 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-900">
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
                picked
                  ? "bg-white ring-[#1D9E75] shadow-md"
                  : "bg-white ring-transparent hover:ring-[#1D9E75]/40"
              }`}
            >
              <FollowupIcon type={f.id} active={picked} compact />
              <p className="mt-2 text-[11px] font-semibold leading-tight text-slate-900">{f.label}</p>
              <p className="mt-1 text-[10px] leading-snug text-slate-500">{f.detail}</p>
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
    consultation: (
      <>
        <rect x="4" y="8" width="28" height="20" rx="4" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="18" cy="18" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      </>
    ),
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
    complements: (
      <>
        <rect x="10" y="12" width="20" height="24" rx="4" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M16 20h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
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
    <aside className="sticky top-24 rounded-2xl border border-[#C8E6D9]/60 bg-white p-5 shadow-lg shadow-[#1D9E75]/5 sm:p-6">
      <h3 className="text-lg font-bold text-slate-900">{copy.sidebarTitle}</h3>
      <p className="mt-1 text-xs text-slate-500">{copy.sidebarSubtitle}</p>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {copy.modulesLine}
      </p>
      <ul className="mt-2 space-y-1">
        {activeModules.map((m) => (
          <li key={m.id} className="flex items-center gap-2 text-sm text-slate-800">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D9E75]" aria-hidden />
            {m.label}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Suivi par jour
      </p>
      <ul className="mt-2 max-h-[200px] space-y-2 overflow-y-auto">
        {planLines.length === 0 ? (
          <li className="text-sm text-slate-500">Sélectionnez vos jours de suivi.</li>
        ) : (
          planLines.map((line) => (
            <li
              key={line.dayId}
              className="flex justify-between gap-2 border-b border-slate-100 pb-2 text-sm last:border-0"
            >
              <span className="text-slate-600">{line.dayLabel}</span>
              <span className="text-right font-medium text-slate-900">
                {line.followup?.label ?? "—"}
              </span>
            </li>
          ))
        )}
      </ul>

      <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">{copy.trackingLine}</span>
          <span className="font-semibold text-slate-900">
            {planLines.length} jour{planLines.length > 1 ? "s" : ""}/sem.
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Modules</span>
          <span className="font-semibold text-slate-900">{activeModules.length}</span>
        </div>
      </div>

      <Link
        href={NUTRI_PLUS_QUESTIONNAIRE_PATH}
        className={`mt-5 flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold text-white transition ${
          canStart
            ? "bg-[var(--teal-900)] shadow-md hover:bg-[var(--teal)]"
            : "pointer-events-none bg-slate-300"
        }`}
        aria-disabled={!canStart}
      >
        {copy.startCta}
      </Link>

      {!canStart && planLines.length > 0 && (
        <p className="mt-3 text-center text-xs text-slate-500">
          {copy.completeHint} ({filled}/{trackingCount}).
        </p>
      )}
    </aside>
  );
}
