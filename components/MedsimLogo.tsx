export function MedsimLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
        M
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-900">Medsim</span>
    </div>
  );
}
