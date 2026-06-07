export function DashboardSpinner({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#1D4D3A] border-t-transparent"
        aria-hidden
      />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}
