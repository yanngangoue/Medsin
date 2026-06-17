export default function PatientDashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF9]">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
        <div className="h-7 w-28 animate-pulse rounded-md bg-slate-200" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-200" />
      </main>
    </div>
  );
}
