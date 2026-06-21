const ITEMS = [
  {
    label: "IPS licenciées",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3l7 4v5c0 4.5-3 8.5-7 9-4-0.5-7-4.5-7-9V7l7-4Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "100 % en ligne",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Prix transparent",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 7v10M9 10h4a2 2 0 1 1 0 4h-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Livraison à domicile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 7h11v10H3V7Zm11 3h4l3 3v4h-7v-7Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
] as const;

export function MarketingHeroTrustStrip() {
  return (
    <section
      className="border-y border-gray-100 bg-white py-8 sm:py-10"
      aria-label="Garanties Anne-sante"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 md:grid-cols-4 lg:px-8">
        {ITEMS.map((item, i) => (
          <div
            key={item.label}
            className={`marketing-hero-in marketing-hero-in-d${i + 5} flex flex-col items-center gap-3 text-center`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D4D3A]/8 text-[#1D4D3A]">
              {item.icon}
            </span>
            <p className="text-sm font-semibold text-[#1A1A2E]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
