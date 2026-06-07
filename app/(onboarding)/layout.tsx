import Link from "next/link";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";

export default function OnboardingGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A2E]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/">
            <MarketingLogo />
          </Link>
          <Link href="/connexion" className="text-sm font-semibold text-[#1D4D3A] hover:underline">
            Connexion
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
    </div>
  );
}
