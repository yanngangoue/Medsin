type Props = {
  prenom: string;
  urgentCount?: number;
};

export function MedecinHeader({ prenom, urgentCount = 0 }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-[#16a34a] md:hidden">MedSim</p>
          <p className="hidden text-sm text-slate-600 md:block">
            Dr. <span className="font-semibold text-slate-900">{prenom}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative" title="Dossiers urgents">
            <span className="text-xl" aria-hidden>
              🔔
            </span>
            {urgentCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                {urgentCount > 9 ? "9+" : urgentCount}
              </span>
            ) : null}
          </span>
          <span className="inline-flex rounded-full bg-[#16a34a]/10 px-3 py-1 text-xs font-bold text-[#16a34a] ring-1 ring-[#16a34a]/25">
            MÉDECIN
          </span>
        </div>
      </div>
    </header>
  );
}
