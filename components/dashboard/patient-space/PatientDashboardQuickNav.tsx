"use client";

import Link from "next/link";
import { PATIENT_DASHBOARD_SECTIONS } from "@/lib/patient/dashboard-routes";
import { useUnreadChatCount } from "@/lib/patient/use-unread-chat";

export function PatientDashboardQuickNav() {
  const unreadChat = useUnreadChatCount();
  return (
    <section aria-labelledby="dashboard-sections-title">
      <h2 id="dashboard-sections-title" className="text-lg font-bold text-slate-900">
        Votre parcours poids
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Programme médical GLP-1, suivi chiffré et Anne — tout au même endroit.
      </p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PATIENT_DASHBOARD_SECTIONS.map((section) => (
          <li key={section.id}>
            <Link
              href={section.href}
              className="relative flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1D4D3A]/30 hover:shadow-md"
            >
              {section.id === "clavardage" && unreadChat > 0 ? (
                <span className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#3EBD93] px-1.5 text-xs font-bold text-white">
                  {unreadChat}
                </span>
              ) : null}
              <span className="text-2xl" aria-hidden>
                {section.icon}
              </span>
              <span className="mt-3 text-base font-bold text-slate-900">{section.title}</span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {section.description}
              </span>
              <span className="mt-4 text-sm font-semibold text-[#1D4D3A]">Ouvrir →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
