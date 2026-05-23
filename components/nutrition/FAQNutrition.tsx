"use client";

import { useState } from "react";
import { FadeIn, SlideUp } from "@/components/nutrition/NutritionMotion";
import { FAQ_ITEMS } from "@/lib/nutrition/content";

export function FAQNutrition() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SlideUp className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#2D5A4E] sm:text-4xl">
            Questions fréquentes
          </h2>
        </SlideUp>

        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openId === item.id;
            return (
              <FadeIn key={item.id} delay={0.05 * i}>
                <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8]">
                  <button
                    type="button"
                    id={`faq-btn-${item.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/80"
                  >
                    <span className="text-base font-semibold text-[#2D5A4E] sm:text-lg">
                      {item.question}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7CAE9E]/20 text-[#2D5A4E] transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      ▼
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${item.id}`}
                    hidden={!isOpen}
                    className="px-6 pb-5"
                  >
                    <p className="text-base leading-relaxed text-[#6B7280]">{item.answer}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
