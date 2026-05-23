import Link from "next/link";

export default function MedecinMessagesPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Messagerie</h1>
      <p className="mt-2 text-sm text-slate-600">
        Ouvrez un dossier patient pour accéder à la messagerie intégrée, ou utilisez l&apos;
        <Link href="/admin/messages" className="text-[#16a34a] hover:underline">
          centre admin
        </Link>
        .
      </p>
    </div>
  );
}
