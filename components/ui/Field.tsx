import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-900/5 outline-none ring-teal-500/30 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-900/5 outline-none ring-teal-500/30 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 ${props.className ?? ""}`}
    />
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}
