"use client";

import { useEffect, useState } from "react";
import { cmToFeetInches, feetInchesToCm } from "@/lib/eligibility";

type Props = {
  valueCm?: number;
  onChangeCm: (cm: number | undefined) => void;
  inputClassName?: string;
};

export function HeightFeetInchesInput({ valueCm, onChangeCm, inputClassName }: Props) {
  const initial = cmToFeetInches(valueCm ?? 0);
  const [feet, setFeet] = useState<number | "">(valueCm ? initial.feet : "");
  const [inches, setInches] = useState<number | "">(valueCm ? initial.inches : "");

  useEffect(() => {
    if (valueCm && valueCm > 0) {
      const parsed = cmToFeetInches(valueCm);
      setFeet(parsed.feet);
      setInches(parsed.inches);
    }
  }, [valueCm]);

  const emit = (f: number | "", i: number | "") => {
    if (f === "" || i === "") {
      onChangeCm(undefined);
      return;
    }
    const cm = feetInchesToCm(Number(f), Number(i));
    onChangeCm(cm > 0 ? cm : undefined);
  };

  const cls =
    inputClassName ??
    "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 pr-14 text-lg font-bold text-slate-900 outline-none transition focus:border-[#3EBD93] focus:ring-4 focus:ring-[#3EBD93]/10";

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Pieds</label>
        <div className="relative">
          <input
            type="number"
            min={3}
            max={8}
            inputMode="numeric"
            value={feet}
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              setFeet(v);
              emit(v, inches);
            }}
            className={cls}
            placeholder="5"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
            pi
          </span>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Pouces</label>
        <div className="relative">
          <input
            type="number"
            min={0}
            max={11}
            inputMode="numeric"
            value={inches}
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              setInches(v);
              emit(feet, v);
            }}
            className={cls}
            placeholder="7"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
            po
          </span>
        </div>
      </div>
    </div>
  );
}
