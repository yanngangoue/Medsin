"use client";

import { useState } from "react";
import { PatientMessagesPanel } from "@/components/dashboard/patient-space/PatientMessagesPanel";
import { PatientTeleconsultPanel } from "@/components/dashboard/patient-space/PatientTeleconsultPanel";

type Tab = "messages" | "video";

type Props = {
  userId: string;
  staffId: string | null;
  messagesLoading: boolean;
};

export function PatientCareHub({ userId, staffId, messagesLoading }: Props) {
  const [tab, setTab] = useState<Tab>("messages");

  return (
    <section
      id="contact-medical"
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm scroll-mt-24"
      aria-labelledby="care-hub-title"
    >
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <h2 id="care-hub-title" className="text-lg font-bold text-slate-900 sm:text-xl">
          Contact avec l&apos;équipe médicale
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Messagerie écrite ou consultation vidéo avec un médecin.
        </p>

        <div
          className="mt-4 flex rounded-xl bg-slate-100 p-1 lg:hidden"
          role="tablist"
          aria-label="Mode de contact"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "messages"}
            onClick={() => setTab("messages")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === "messages"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Messagerie
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "video"}
            onClick={() => setTab("video")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === "video"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Visio
          </button>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-2 lg:divide-x lg:divide-slate-100">
        <PatientMessagesPanel
          userId={userId}
          staffId={staffId}
          loading={messagesLoading}
          embedded
        />
        <PatientTeleconsultPanel />
      </div>

      <div className="lg:hidden">
        {tab === "messages" ? (
          <PatientMessagesPanel
            userId={userId}
            staffId={staffId}
            loading={messagesLoading}
            embedded
          />
        ) : (
          <PatientTeleconsultPanel />
        )}
      </div>
    </section>
  );
}
