const QUEBEC_TZ = "America/Montreal";

type QuebecDateParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
};

function quebecParts(from: Date): QuebecDateParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: QUEBEC_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  });
  const parts = fmt.formatToParts(from);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const wdMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: wdMap[get("weekday")] ?? 0,
    hour: Number(get("hour")),
  };
}

/** Lundi 00:00 de la semaine courante (fuseau Québec). */
export function startOfWeekMondayQuebec(from = new Date()): Date {
  const { year, month, day, weekday } = quebecParts(from);
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  const mondayDay = day - daysFromMonday;
  return new Date(Date.UTC(year, month - 1, mondayDay, 5, 0, 0));
}

/** Check-in enregistré depuis le lundi courant (Québec). */
export function hasCheckInThisWeekQuebec(
  checkIns: { recordedAt: Date | string }[],
  from = new Date(),
): boolean {
  const weekStart = startOfWeekMondayQuebec(from);
  return checkIns.some((c) => new Date(c.recordedAt) >= weekStart);
}

/** Vrai si lundi 9 h au Québec (± fenêtre cron). */
export function isMondayMorningQuebec(from = new Date()): boolean {
  const p = quebecParts(from);
  return p.weekday === 1 && p.hour === 9;
}

/** Prochain lundi à 9 h (heure locale serveur). */
export function nextMondayAt9h(from = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(9, 0, 0, 0);
  return d;
}

export function startOfWeekMonday(from = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekNumberSince(startDate: Date, from = new Date()): number {
  const days = Math.floor((from.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(days / 7) + 1);
}

export function formatFrDate(d: Date): string {
  return d.toLocaleDateString("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
