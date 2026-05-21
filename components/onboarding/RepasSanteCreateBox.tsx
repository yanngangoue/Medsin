"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatPrice,
  mealById,
  type RepasMeal,
} from "@/lib/patient/repas-meals";

const DAY_COUNTS = [3, 5, 7] as const;
type DayCount = (typeof DAY_COUNTS)[number];

const WEEKDAYS = [
  { id: "lun", label: "Lun", full: "Lundi" },
  { id: "mar", label: "Mar", full: "Mardi" },
  { id: "mer", label: "Mer", full: "Mercredi" },
  { id: "jeu", label: "Jeu", full: "Jeudi" },
  { id: "ven", label: "Ven", full: "Vendredi" },
  { id: "sam", label: "Sam", full: "Samedi" },
  { id: "dim", label: "Dim", full: "Dimanche" },
] as const;

const DEFAULT_DAYS: Record<DayCount, readonly string[]> = {
  3: ["lun", "mer", "ven"],
  5: ["lun", "mar", "mer", "jeu", "ven"],
  7: ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"],
};

const dayById = Object.fromEntries(WEEKDAYS.map((d) => [d.id, d])) as Record<
  string,
  (typeof WEEKDAYS)[number]
>;

const BOX_CALLBACK = "/onboarding/repas-sante?box=1#creer-votre-boite";

type Props = {
  meals: readonly RepasMeal[];
};

export function RepasSanteCreateBox({ meals }: Props) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [isOpen, setIsOpen] = useState(false);
  const [mealCount, setMealCount] = useState<DayCount>(5);
  const [mealDays, setMealDays] = useState<string[]>([...DEFAULT_DAYS[5]]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("box") === "1" || window.location.hash === "#creer-votre-boite") {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    setMealDays([...DEFAULT_DAYS[mealCount]]);
    setSelections({});
  }, [mealCount]);

  useEffect(() => {
    setSelections((prev) => {
      const next: Record<string, string> = {};
      for (const dayId of mealDays) {
        if (prev[dayId]) next[dayId] = prev[dayId];
      }
      return next;
    });
  }, [mealDays]);

  const toggleMealDay = useCallback(
    (id: string) => {
      setMealDays((prev) => {
        if (prev.includes(id)) {
          if (prev.length <= 1) return prev;
          return prev.filter((d) => d !== id);
        }
        if (prev.length >= mealCount) return prev;
        return [...prev, id];
      });
    },
    [mealCount],
  );

  const sortedMealSlots = useMemo(() => {
    const order = WEEKDAYS.map((d) => d.id);
    return [...mealDays].sort(
      (a, b) =>
        order.indexOf(a as (typeof WEEKDAYS)[number]["id"]) -
        order.indexOf(b as (typeof WEEKDAYS)[number]["id"]),
    );
  }, [mealDays]);

  const cartLines = useMemo(
    () =>
      sortedMealSlots.map((dayId) => {
        const day = dayById[dayId];
        const mealId = selections[dayId];
        const meal = mealId ? mealById[mealId] : undefined;
        return { dayId, dayLabel: day?.full ?? dayId, meal };
      }),
    [sortedMealSlots, selections],
  );

  const subtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + (line.meal?.price ?? 0), 0),
    [cartLines],
  );

  const allMealsSelected = cartLines.length === mealCount && cartLines.every((l) => l.meal);

  const openBox = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      document.getElementById("creer-votre-boite")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const selectMealForDay = (dayId: string, mealId: string) => {
    setSelections((prev) => ({ ...prev, [dayId]: mealId }));
  };

  const handlePay = async () => {
    if (!allMealsSelected) return;
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setPayError(data.error ?? "Paiement indisponible pour le moment.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setPayError("Impossible d’ouvrir le paiement.");
    } catch {
      setPayError("Erreur réseau. Réessayez.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <section
      id="creer-votre-boite"
      className="border-t border-[#E8A87C]/25 bg-[#FAF7F4] py-14 sm:py-16"
      aria-labelledby="create-box-title"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2
          id="create-box-title"
          className="text-center text-2xl font-bold tracking-tight text-[#2A1F18] sm:text-3xl"
        >
          Créer votre boîte
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-[#5C4A40] sm:text-[15px]">
          Une boîte de repas, une livraison. Composez-la ici et choisissez vos plats santé.
        </p>

        {!isOpen ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={openBox}
              className="w-full max-w-md rounded-xl bg-[#E8A87C] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[#D4845F] sm:text-lg"
            >
              Créer votre boîte
            </button>
          </div>
        ) : (
          <div className="mt-8">
            {status === "loading" ? (
              <p className="text-center text-sm text-[#5C4A40]">Chargement…</p>
            ) : !isAuthenticated ? (
              <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-[#E8A87C]/25 sm:p-8">
                <p className="text-sm font-semibold text-[#2A1F18]">
                  Connectez-vous pour composer votre boîte
                </p>
                <p className="mt-2 text-sm text-[#5C4A40]">
                  Créez un compte ou connectez-vous pour choisir vos repas et finaliser la commande.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href={`/auth/connexion?callbackUrl=${encodeURIComponent(BOX_CALLBACK)}`}
                    className="inline-flex justify-center rounded-md bg-[var(--teal-900)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href={`/auth/inscription?service=repas-sante&callbackUrl=${encodeURIComponent(BOX_CALLBACK)}`}
                    className="inline-flex justify-center rounded-md bg-[#E8A87C] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D4845F]"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
                <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8A87C]/20 sm:p-8">
                  <div>
                    <p className="text-sm font-semibold text-[#2A1F18]">Nombre de repas dans la boîte</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {DAY_COUNTS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setMealCount(n)}
                          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                            mealCount === n
                              ? "bg-[#E8A87C] text-white shadow-md"
                              : "bg-[#FFF4ED] text-[#5C4A40] ring-1 ring-[#E8A87C]/40 hover:bg-[#FFE8DB]"
                          }`}
                        >
                          {n} jours
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#2A1F18]">
                      Associez chaque repas à un jour ({mealDays.length}/{mealCount})
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => {
                        const active = mealDays.includes(day.id);
                        const disabled = !active && mealDays.length >= mealCount;
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleMealDay(day.id)}
                            disabled={disabled}
                            className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold sm:h-12 sm:w-12 ${
                              active
                                ? "bg-[var(--teal-900)] text-white"
                                : disabled
                                  ? "cursor-not-allowed bg-stone-100 text-stone-400"
                                  : "bg-[#FFF4ED] text-[#5C4A40] ring-1 ring-[#E8A87C]/35"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-6 border-t border-stone-100 pt-6">
                    <p className="text-sm font-semibold text-[#2A1F18]">Choisissez vos repas santé</p>
                    {sortedMealSlots.map((dayId, index) => {
                      const day = dayById[dayId];
                      const selectedId = selections[dayId];
                      return (
                        <div key={dayId} className="rounded-xl border border-[#E8A87C]/25 bg-[#FFF8F3] p-4">
                          <p className="mb-3 text-sm font-semibold text-[#2A1F18]">
                            Repas {index + 1} — {day?.full}
                          </p>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {meals.map((meal) => {
                              const picked = selectedId === meal.id;
                              return (
                                <button
                                  key={meal.id}
                                  type="button"
                                  onClick={() => selectMealForDay(dayId, meal.id)}
                                  className={`overflow-hidden rounded-lg text-left ring-2 transition ${
                                    picked
                                      ? "ring-[#E8A87C] bg-white"
                                      : "ring-transparent bg-white hover:ring-[#E8A87C]/50"
                                  }`}
                                >
                                  <div className="relative aspect-[4/3] w-full">
                                    <Image
                                      src={meal.src}
                                      alt={meal.alt}
                                      fill
                                      className="object-cover"
                                      sizes="120px"
                                    />
                                  </div>
                                  <div className="p-2">
                                    <p className="text-[11px] font-medium leading-tight text-[#2A1F18]">
                                      {meal.label}
                                    </p>
                                    <p className="text-[10px] text-[#D4845F]">{formatPrice(meal.price)}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <aside className="sticky top-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-[#E8A87C]/25 lg:p-6">
                  <h3 className="text-lg font-bold text-[#2A1F18]">Votre panier</h3>
                  <p className="mt-1 text-xs text-[#5C4A40]">Livraison unique incluse</p>
                  <ul className="mt-4 max-h-[280px] space-y-2 overflow-y-auto">
                    {cartLines.length === 0 ? (
                      <li className="text-sm text-stone-500">Sélectionnez vos jours de repas.</li>
                    ) : (
                      cartLines.map((line) => (
                        <li
                          key={line.dayId}
                          className="flex justify-between gap-2 border-b border-stone-100 pb-2 text-sm last:border-0"
                        >
                          <span className="text-[#5C4A40]">
                            {line.dayLabel}
                            <br />
                            <span className="font-medium text-[#2A1F18]">
                              {line.meal?.label ?? "—"}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium text-[#2A1F18]">
                            {line.meal ? formatPrice(line.meal.price) : "—"}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="mt-4 border-t border-stone-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5C4A40]">Sous-total</span>
                      <span className="font-semibold text-[#2A1F18]">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm">
                      <span className="text-[#5C4A40]">Livraison</span>
                      <span className="font-medium text-[var(--teal-900)]">Gratuite</span>
                    </div>
                    <div className="mt-3 flex justify-between border-t border-stone-200 pt-3">
                      <span className="font-semibold text-[#2A1F18]">Total</span>
                      <span className="text-lg font-bold text-[#2A1F18]">{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                  {payError && (
                    <p className="mt-3 text-xs text-red-600" role="alert">
                      {payError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={!allMealsSelected || paying}
                    className="mt-4 w-full rounded-md bg-[var(--teal-900)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--teal)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {paying ? "Redirection…" : "Payer et commander"}
                  </button>
                  {!allMealsSelected && cartLines.length > 0 && (
                    <p className="mt-2 text-center text-xs text-[#5C4A40]">
                      Choisissez un plat pour chaque jour ({cartLines.filter((l) => l.meal).length}/
                      {mealCount}).
                    </p>
                  )}
                </aside>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
