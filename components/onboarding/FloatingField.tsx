"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  error?: string;
};

export const FloatingField = forwardRef<HTMLInputElement, Props>(function FloatingField(
  { label, error, id, type = "text", ...rest },
  ref,
) {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder=" "
          className="peer h-12 w-full rounded-xl border border-slate-200 bg-white px-3 pb-2 pt-4 text-base text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
          {...rest}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-1/2 origin-left -translate-y-1/2 text-sm text-slate-500 transition-all duration-200 peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-[#1D9E75] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {label}
        </label>
      </div>
      {error ? <p className="mt-1 text-[12px] text-red-600/90">{error}</p> : null}
    </div>
  );
});
