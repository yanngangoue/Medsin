export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAF9]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
