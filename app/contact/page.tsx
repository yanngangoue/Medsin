import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { Footer } from "@/components/Footer";
import { MedsimLogo } from "@/components/MedsimLogo";

export const metadata = {
  title: "Contact — Anne-sante",
  description: "Contactez l'équipe Anne-sante pour toute question sur nos services de santé métabolique.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/">
            <MedsimLogo />
          </Link>
          <Link href="/" className="text-sm font-medium text-[var(--teal-900)] hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Contact</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Une question sur votre parcours GLP-1 ou nos services ? Écrivez-nous.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Coordonnées</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <span className="font-medium text-slate-800">Courriel</span>
                <br />
                <a
                  href="mailto:support@medsim.ca"
                  className="text-[var(--teal-900)] hover:underline"
                >
                  support@medsim.ca
                </a>
              </li>
              <li>
                <span className="font-medium text-slate-800">Heures</span>
                <br />
                Lundi au vendredi, 9 h à 17 h (HE)
              </li>
              <li>
                <span className="font-medium text-slate-800">Délai de réponse</span>
                <br />
                1 à 2 jours ouvrables
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Formulaire</h2>
            <div className="mt-4">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
