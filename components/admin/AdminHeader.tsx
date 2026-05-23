type Props = {
  prenom: string;
  role: string;
  title?: string;
};

export function AdminHeader({ prenom, role, title }: Props) {
  const roleLabel = role === "ADMIN" ? "ADMIN" : "MÉDECIN";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {title ? (
            <h1 className="text-lg font-semibold text-slate-900 md:hidden">{title}</h1>
          ) : (
            <p className="text-lg font-bold text-[#16a34a] md:hidden">MedSim</p>
          )}
          <p className="hidden text-sm text-slate-500 md:block">
            Bonjour, <span className="font-semibold text-slate-900">{prenom}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium text-slate-800 sm:inline">{prenom}</span>
          <span className="inline-flex rounded-full bg-[#16a34a]/10 px-3 py-1 text-xs font-bold text-[#16a34a] ring-1 ring-[#16a34a]/20">
            {roleLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
