import { TRUST_ITEMS } from "@/lib/marketing/landing-content";

export function MarketingTrustBar() {
  return (
    <section className="bg-[#1D4D3A] py-5 text-white" aria-label="Garanties MedSim">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item.label}
              className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
            >
              <span className="text-2xl" aria-hidden>
                {item.icon}
              </span>
              <span className="text-xs font-medium leading-snug sm:text-sm">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
