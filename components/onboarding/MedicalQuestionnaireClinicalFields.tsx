"use client";

import {
  GLP1_BLOOD_PRESSURE_OPTIONS,
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
  GLP1_HEALTH_NONE_LABEL,
  GLP1_HEART_RATE_OPTIONS,
  MONTHS_FR,
} from "@/lib/patient/glp1-eligibility-questions";

const ACCENT = "#6C63FF";

function pillClass(active: boolean) {
  return `px-3 py-2 text-xs rounded-full border-2 font-medium transition-all duration-150 ${
    active
      ? "border-transparent text-white shadow-sm"
      : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB]"
  }`;
}

function pillStyle(active: boolean): React.CSSProperties | undefined {
  return active ? { backgroundColor: ACCENT, borderColor: ACCENT } : undefined;
}

export function toggleHealthList(list: string[], id: string, noneId: string): string[] {
  if (id === noneId) return [noneId];
  const withoutNone = list.filter((x) => x !== noneId);
  if (withoutNone.includes(id)) return withoutNone.filter((x) => x !== id);
  return [...withoutNone, id];
}

type HealthChecklistProps = {
  items: readonly { id: string; label: string }[];
  noneId: string;
  selected: string[];
  onChange: (next: string[]) => void;
};

export function HealthChecklist({ items, noneId, selected, onChange }: HealthChecklistProps) {
  return (
    <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
      {items.map((item) => {
        const checked = selected.includes(item.id);
        return (
          <label
            key={item.id}
            className={`flex cursor-pointer gap-2 rounded-lg border px-2.5 py-2 text-[10px] leading-snug transition ${
              checked
                ? "border-[#6C63FF]/40 bg-[#6C63FF]/5 text-[#1A1A2E]"
                : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#D1D5DB]"
            }`}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-3 w-3 shrink-0 accent-[#6C63FF]"
              checked={checked}
              onChange={() => onChange(toggleHealthList(selected, item.id, noneId))}
            />
            <span>{item.label}</span>
          </label>
        );
      })}
      <label
        className={`flex cursor-pointer gap-2 rounded-lg border px-2.5 py-2 text-[10px] font-medium leading-snug transition ${
          selected.includes(noneId)
            ? "border-emerald-400/50 bg-emerald-50 text-emerald-800"
            : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#D1D5DB]"
        }`}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-3 w-3 shrink-0 accent-emerald-600"
          checked={selected.includes(noneId)}
          onChange={() => onChange(toggleHealthList(selected, noneId, noneId))}
        />
        <span>{GLP1_HEALTH_NONE_LABEL}</span>
      </label>
    </div>
  );
}

export function GenderSelect({
  value,
  onChange,
}: {
  value?: "male" | "female";
  onChange: (v: "male" | "female") => void;
}) {
  return (
    <div className="flex gap-2">
      {(
        [
          ["female", "Femme"],
          ["male", "Homme"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={`${pillClass(value === id)} flex-1`}
          style={pillStyle(value === id)}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function BirthDateFields({
  birthMonth,
  birthDay,
  birthYear,
  onChange,
}: {
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  onChange: (patch: { birthMonth?: string; birthDay?: string; birthYear?: string }) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-2 text-[10px] text-[#1A1A2E] outline-none focus:border-[#6C63FF]"
        value={birthMonth ?? ""}
        onChange={(e) => onChange({ birthMonth: e.target.value })}
      >
        <option value="">Mois</option>
        {MONTHS_FR.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={31}
        placeholder="Jour"
        className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-2 text-center text-[10px] outline-none focus:border-[#6C63FF]"
        value={birthDay ?? ""}
        onChange={(e) => onChange({ birthDay: e.target.value })}
      />
      <input
        type="number"
        inputMode="numeric"
        min={1920}
        max={new Date().getFullYear() - 18}
        placeholder="Année"
        className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-2 text-center text-[10px] outline-none focus:border-[#6C63FF]"
        value={birthYear ?? ""}
        onChange={(e) => onChange({ birthYear: e.target.value })}
      />
    </div>
  );
}

export function YesNoSelect({
  value,
  onChange,
}: {
  value?: "oui" | "non";
  onChange: (v: "oui" | "non") => void;
}) {
  return (
    <div className="flex gap-2">
      {(
        [
          ["oui", "Oui"],
          ["non", "Non"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={`${pillClass(value === id)} flex-1`}
          style={pillStyle(value === id)}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function BloodPressureSelect({
  value,
  onChange,
}: {
  value?: (typeof GLP1_BLOOD_PRESSURE_OPTIONS)[number]["id"];
  onChange: (v: (typeof GLP1_BLOOD_PRESSURE_OPTIONS)[number]["id"]) => void;
}) {
  return (
    <ul className="space-y-1.5">
      {GLP1_BLOOD_PRESSURE_OPTIONS.map((opt) => (
        <li key={opt.id}>
          <button
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
              value === opt.id
                ? "border-[#6C63FF] bg-[#6C63FF]/5"
                : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
            }`}
          >
            <span className="text-sm">🩸</span>
            <span>
              <span className="block text-[10px] font-semibold text-[#1A1A2E]">{opt.label}</span>
              <span className="text-[10px] text-[#6B7280]">{opt.hint}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function HeartRateSelect({
  value,
  onChange,
}: {
  value?: (typeof GLP1_HEART_RATE_OPTIONS)[number]["id"];
  onChange: (v: (typeof GLP1_HEART_RATE_OPTIONS)[number]["id"]) => void;
}) {
  return (
    <ul className="space-y-1.5">
      {GLP1_HEART_RATE_OPTIONS.map((opt) => (
        <li key={opt.id}>
          <button
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
              value === opt.id
                ? "border-[#6C63FF] bg-[#6C63FF]/5"
                : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
            }`}
          >
            <span className="text-sm">💓</span>
            <span>
              <span className="block text-[10px] font-semibold text-[#1A1A2E]">{opt.label}</span>
              <span className="text-[10px] text-[#6B7280]">{opt.hint}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export {
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
};
