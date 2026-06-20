import { ChatCoachIa } from "@/components/marketing/ChatCoachIa";
import { AI_COACH_BENEFITS } from "@/lib/marketing/landing-content";

export function MarketingAiCoach() {
  return (
    <section className="bg-[#F0F7F4] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center lg:max-w-none lg:text-left">
          <h2 className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            Votre coach santé IA — bien plus qu&apos;un suivi classique
          </h2>
          <p className="mt-4 text-base text-[#1A1A2E]/70 lg:hidden">
            Felix et les cliniques classiques vous laissent seul entre les rendez-vous. Anne-sante vous
            contacte en premier.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <ChatCoachIa />

          <div>
            <p className="hidden text-base text-[#1A1A2E]/70 lg:block">
              Felix et les cliniques classiques vous laissent seul entre les rendez-vous. Anne-sante
              vous contacte en premier — même prix, meilleur accompagnement.
            </p>

            <ul className="mt-6 space-y-4 lg:mt-8">
              {AI_COACH_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-[#1A1A2E]/85">
                  <span className="mt-0.5 font-bold text-[#3EBD93]" aria-hidden>
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-[#1D4D3A]/10 bg-white p-5 text-sm text-[#1A1A2E]/75">
              <p className="font-semibold text-[#1D4D3A]">Anne-sante vs Felix Health</p>
              <ul className="mt-3 space-y-2">
                <li>✅ Anne, coach IA proactive — analyse vos données et vous écrit en premier</li>
                <li>✅ Tableau de bord visuel complet</li>
                <li>✅ Interface moderne pensée pour le Québec</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
