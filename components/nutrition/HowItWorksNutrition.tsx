import { FadeIn, SlideUp } from "@/components/nutrition/NutritionMotion";
import { HOW_IT_WORKS_STEPS } from "@/lib/nutrition/content";

function StepIcon({ step }: { step: number }) {
  const icons: Record<number, string> = {
    1: "📋",
    2: "🌿",
    3: "📦",
  };
  return (
    <span
      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7CAE9E]/15 text-2xl"
      aria-hidden
    >
      {icons[step] ?? "✓"}
    </span>
  );
}

export function HowItWorksNutrition() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-20 bg-[#F0F7F4] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#2D5A4E] shadow-sm">
              Simple et personnalisé
            </span>
          </FadeIn>
          <SlideUp delay={0.08} className="mt-6">
            <h2 className="text-3xl font-semibold tracking-tight text-[#2D5A4E] sm:text-4xl">
              Un parcours en 3 étapes
            </h2>
          </SlideUp>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {HOW_IT_WORKS_STEPS.map((item, i) => (
            <FadeIn key={item.step} delay={0.1 + i * 0.1}>
              <article className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex items-center gap-4">
                  <StepIcon step={item.step} />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7CAE9E] text-sm font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#2D5A4E]">{item.title}</h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-[#6B7280]">
                  {item.description}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
