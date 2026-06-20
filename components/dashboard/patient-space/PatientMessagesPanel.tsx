"use client";

import { MessageThread } from "@/components/messages/MessageThread";

type Props = {
  userId: string;
  staffId: string | null;
  loading: boolean;
  /** Dans le hub côte à côte (sans bordure externe). */
  embedded?: boolean;
};

export function PatientMessagesPanel({ userId, staffId, loading, embedded }: Props) {
  const inner = (
    <>
      {!embedded ? (
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">Messagerie sécurisée</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Posez vos questions sur votre dossier. Un membre de l&apos;équipe Anne-sante vous répond.
          </p>
        </div>
      ) : (
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-lg font-bold text-slate-900">Messagerie</h3>
          <p className="mt-1 text-sm text-slate-600">Échanges écrits avec l&apos;équipe.</p>
        </div>
      )}
      <div className="px-4 py-4 sm:px-6">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Connexion à la messagerie…</p>
        ) : staffId ? (
          <MessageThread peerId={staffId} currentUserId={userId} title="Équipe Anne-sante" />
        ) : (
          <div className="rounded-xl bg-amber-50/80 px-4 py-6 text-center text-sm text-amber-950">
            <p className="font-medium">Messagerie en configuration</p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">
              Réessayez plus tard ou prenez un rendez-vous en visio.
            </p>
          </div>
        )}
      </div>
    </>
  );

  if (embedded) return <div className="flex h-full flex-col">{inner}</div>;

  return (
    <section
      className="rounded-2xl border border-slate-200/90 bg-white shadow-sm"
      aria-labelledby="messages-title"
    >
      {inner}
    </section>
  );
}
