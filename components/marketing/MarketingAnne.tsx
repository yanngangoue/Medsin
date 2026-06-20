import type { ReactNode } from "react";

const ANNE_ACTIONS = [
  { icon: "🔔", text: "Rappels de dose automatiques chaque semaine" },
  { icon: "📊", text: "Analyse vos données poids, énergie, sommeil" },
  {
    icon: "⚠️",
    text: "Détecte les effets secondaires avant qu'ils deviennent un problème",
  },
  { icon: "📋", text: "Prépare un rapport structuré pour votre IPS" },
  { icon: "💬", text: "Vous écrit en premier — pas l'inverse" },
  { icon: "🚨", text: "Alerte votre IPS si quelque chose sort de l'ordinaire" },
  { icon: "🌙", text: "Disponible à 2 h du matin si vous avez une question" },
];

function ChatBubble({
  role,
  time,
  children,
}: {
  role: "anne" | "patient";
  time: string;
  children: ReactNode;
}) {
  const isAnne = role === "anne";
  return (
    <div className={`flex flex-col gap-1 ${isAnne ? "items-start" : "items-end"}`}>
      <span className="text-[10px] text-gray-400">{time}</span>
      <div
        className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isAnne
            ? "rounded-bl-md border border-[#1D4D3A]/15 bg-white text-[#1A1A2E]"
            : "rounded-br-md bg-[#1D4D3A] text-white"
        }`}
      >
        {isAnne ? (
          <p className="mb-1 text-xs font-semibold text-[#1D4D3A]">🤖 Anne</p>
        ) : (
          <p className="mb-1 text-xs font-semibold text-white/80">👤 Marie-Ève</p>
        )}
        <div className="whitespace-pre-line">{children}</div>
      </div>
    </div>
  );
}

export function MarketingAnne() {
  return (
    <section id="anne" className="bg-[#F0F7F4] py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#1D4D3A]">
            Coach IA Anne-sante
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#1A1A2E] sm:text-5xl">
            Anne ne vous attend pas.
            <br />
            Elle vient à vous.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            Contrairement aux autres plateformes, Anne initie le contact. Chaque semaine, sans
            exception.
          </p>

          <ul className="mt-10 space-y-4">
            {ANNE_ACTIONS.map((action) => (
              <li key={action.text} className="flex gap-3 text-sm text-gray-700 sm:text-base">
                <span className="shrink-0 text-lg" aria-hidden>
                  {action.icon}
                </span>
                {action.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-[#1D4D3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D4D3A] text-lg font-black text-white">
              A
            </div>
            <div>
              <p className="font-semibold text-[#1A1A2E]">Anne</p>
              <p className="text-xs text-gray-500">Coach santé IA · En ligne</p>
            </div>
          </div>

          <div className="flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1">
            <p className="text-center text-[10px] font-medium text-gray-400">Lundi 08 h 14</p>

            <ChatBubble role="anne" time="">
              {`Bonjour Marie-Ève ! C'est votre semaine 6 sur Ozempic. J'ai analysé vos données : vous avez perdu 1,4 kg cette semaine — excellent rythme.

J'ai remarqué que votre niveau d'énergie a baissé à 2/5 jeudi. Est-ce que les nausées sont revenues ?`}
            </ChatBubble>

            <ChatBubble role="patient" time="08 h 22">
              Oui un peu, surtout le soir...
            </ChatBubble>

            <ChatBubble role="anne" time="08 h 22">
              {`C'est normal en semaine 6. Voici 3 ajustements simples qui aident beaucoup :
1. Manger plus lentement au souper
2. Éviter les aliments gras le soir
3. Boire 500 ml d'eau 30 min avant le repas

Si ça persiste plus de 3 jours, j'en informe votre IPS directement. Vous voulez que je lui envoie un message ?`}
            </ChatBubble>
          </div>

          <p className="mt-5 rounded-full bg-[#F0F7F4] py-2 text-center text-xs font-semibold text-[#1D4D3A]">
            ⚡ Anne répond en moins de 30 secondes
          </p>
        </div>
      </div>
    </section>
  );
}
