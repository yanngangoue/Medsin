import { FadeIn } from "@/components/nutrition/NutritionMotion";
import { TRUST_ITEMS } from "@/lib/nutrition/content";

export function TrustBar() {
  return (
    <section
      className="border-y border-[#E5E7EB] bg-white py-8"
      aria-label="Garanties Nutri+"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-12 sm:gap-y-4 lg:gap-x-16">
          {TRUST_ITEMS.map((item, i) => (
            <FadeIn key={item.label} delay={i * 0.06} direction="none">
              <li className="flex items-center justify-center gap-2.5 text-center sm:justify-start">
                <span className="text-xl" aria-hidden>
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-[#2D5A4E] sm:text-base">
                  {item.label}
                </span>
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
