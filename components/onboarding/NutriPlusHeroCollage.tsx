import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import { NUTRI_PLUS_HERO_PLATES } from "@/lib/patient/nutri-plus-images";

/** Collage hero — compléments en cercles (aligné landing Nutri+). */
export function NutriPlusHeroCollage() {
  return (
    <div
      className="relative mx-auto h-[200px] w-full max-w-[340px] sm:h-[240px] sm:max-w-[380px] md:mx-0 md:h-[260px] md:max-w-none lg:h-[270px]"
      aria-hidden
    >
      {NUTRI_PLUS_HERO_PLATES.map((plate, i) => (
        <div key={plate.src} className={`absolute ${plate.position} ${plate.size}`}>
          <div className="relative h-full w-full rounded-full bg-white p-1.5 shadow-[0_8px_28px_rgba(29,78,59,0.14)] ring-1 ring-[#1D9E75]/10 sm:p-2">
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <NutriPlusImage
                src={plate.src}
                alt={plate.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 40vw, 300px"
                priority={i === 0}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
