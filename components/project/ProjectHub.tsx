import Link from "next/link";
import { PROJECT_MAP_SECTIONS } from "@/lib/project-hub";

export function ProjectHub() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1D9E75]">Anne-sante — mode développement</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Carte du projet</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Toutes les pages et modules du MVP. Cliquez pour ouvrir. Pour la landing marketing seule, définissez{" "}
            <code className="rounded bg-slate-100 px-1">MEDSIM_SHOW_PROJECT_HUB=false</code> dans{" "}
            <code className="rounded bg-slate-100 px-1">.env</code> puis redémarrez le serveur.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/connexion"
              className="rounded-lg bg-[#1D9E75] px-4 py-2 text-sm font-medium text-white hover:bg-[#188763]"
            >
              Se connecter
            </Link>
            <Link
              href="/dev/interop-test"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Test interop métabolique
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
        {PROJECT_MAP_SECTIONS.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            {section.description ? <p className="mt-1 text-sm text-slate-500">{section.description}</p> : null}
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {section.links.map((link) => {
                const isApi = link.href.startsWith("/api/");
                const isDoc = link.href.endsWith(".md");
                const external = isDoc;
                return (
                  <li key={link.href + link.label}>
                    {external ? (
                      <span className="block rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">{link.label}</span>
                        {link.note ? <span className="ml-1 text-xs text-slate-400">({link.note})</span> : null}
                        <br />
                        <code className="text-xs">{link.href}</code>
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="group flex flex-col rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 transition hover:border-[#1D9E75]/40 hover:bg-[#1D9E75]/5"
                      >
                        <span className="font-medium text-slate-800 group-hover:text-[#1D9E75]">
                          {link.label}
                          {isApi ? (
                            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                              API
                            </span>
                          ) : null}
                        </span>
                        <span className="text-xs text-slate-500">{link.href}</span>
                        {link.note ? <span className="mt-0.5 text-xs text-slate-400">{link.note}</span> : null}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="pb-8 text-center text-xs text-slate-400">
          Commit local — interop FHIR, GLP-1, assistant IA, espaces pro
        </p>
      </main>
    </div>
  );
}
