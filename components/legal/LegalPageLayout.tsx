import Link from "next/link";
import { Footer } from "@/components/Footer";
import { MedsimLogo } from "@/components/MedsimLogo";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/">
            <MedsimLogo />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[var(--teal-900)] hover:underline"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-slate-700">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
