import type { Metadata } from "next";
import Link from "next/link";
import { ConfidentialiteContent } from "@/components/marketing/ConfidentialiteContent";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Anne Santé",
  description: "Protection des données et conformité Loi 25 (Québec) et LPRPDE (Canada).",
};

export default function ConfidentialitePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      <header className="border-b border-[#E5E7EB] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/">
            <MarketingLogo />
          </Link>
          <Link href="/connexion" className="text-sm font-semibold text-[#1D4D3A]">
            Connexion
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <ConfidentialiteContent />
      </main>
      <MarketingFooter />
    </div>
  );
}
