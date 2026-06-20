import { AI_COACH_CHAT } from "@/lib/marketing/landing-content";

/** Mockup statique du chat coach IA — section marketing. */
export function ChatCoachIa() {
  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
      role="img"
      aria-label="Aperçu de conversation avec Anne, coach santé Anne-sante"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-sm text-[#1D4D3A]">
          ✦
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1A1A2E]">Anne — coach santé</p>
          <p className="text-xs text-[#1A1A2E]/55">Propulsé par Claude</p>
        </div>
      </div>

      <ul className="space-y-3">
        {AI_COACH_CHAT.map((msg, i) => (
          <li
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#1D4D3A] text-white"
                  : "border border-gray-100 bg-[#FAFAF8] text-[#1A1A2E]"
              }`}
            >
              <span className="sr-only">{msg.role === "user" ? "Vous" : "Anne"} : </span>
              {msg.role === "assistant" ? (
                <span aria-hidden className="mr-1">
                  🤖
                </span>
              ) : (
                <span aria-hidden className="mr-1">
                  👤
                </span>
              )}
              {msg.content}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-[10px] text-[#1A1A2E]/45">
        Aperçu illustratif — pas un avis médical
      </p>
    </div>
  );
}
