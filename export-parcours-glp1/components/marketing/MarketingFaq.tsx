"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/marketing/landing-content";

export function MarketingFaq() {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#1D4D3A]">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            Questions fréquentes
          </h2>
        </div>

        <ul className="mt-10 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-[#FAFAF8]">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openId === index;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : index)}
                >
                  <span className="font-semibold text-[#1A1A2E]">{item.q}</span>
                  <span
                    className="mt-0.5 shrink-0 text-xl leading-none text-[#1D4D3A]"
                    aria-hidden
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <p className="px-6 pb-5 text-sm leading-relaxed text-[#1A1A2E]/75">{item.a}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
