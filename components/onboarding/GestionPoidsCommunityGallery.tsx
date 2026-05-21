import { GLP1_GALLERY_BULLETS, GLP1_GALLERY_COLUMNS } from "@/lib/patient/glp1-gallery";
import { HoverZoomImage } from "@/components/ui/HoverZoomImage";

function GoldCheck() {
  return (
    <span
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C9A66B] text-[11px] font-bold text-white"
      aria-hidden
    >
      ✓
    </span>
  );
}

function PortraitTile({
  portrait,
  priority,
}: {
  portrait: (typeof GLP1_GALLERY_COLUMNS)[number][number];
  priority?: boolean;
}) {
  return (
    <HoverZoomImage
      src={portrait.src}
      alt={portrait.alt}
      fill
      zoom="strong"
      sizes="(max-width: 640px) 30vw, 180px"
      priority={priority}
      containerClassName={`w-full rounded-2xl bg-[#E8E4DF] shadow-sm ring-1 ring-black/[0.04] ${portrait.heightClass}`}
      imageClassName="object-cover object-center"
    />
  );
}

type Props = {
  className?: string;
};

export function GestionPoidsCommunityGallery({ className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      <ul className="relative z-20 mx-auto mb-6 max-w-lg space-y-2.5 sm:mb-8 sm:max-w-xl">
        {GLP1_GALLERY_BULLETS.map((text) => (
          <li key={text} className="flex gap-3 text-left text-[13px] leading-snug text-slate-800 sm:text-sm">
            <GoldCheck />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <div className="relative mx-auto max-w-[520px] sm:max-w-[600px]">
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {GLP1_GALLERY_COLUMNS.map((column, colIndex) => (
            <div
              key={colIndex}
              className={`flex w-[30%] flex-col gap-2 sm:gap-2.5 ${
                colIndex === 1 ? "-mt-3 sm:-mt-5" : colIndex === 2 ? "-mt-1" : "mt-2"
              }`}
            >
              {column.map((portrait, i) => (
                <PortraitTile
                  key={portrait.id}
                  portrait={portrait}
                  priority={colIndex === 0 && i === 0}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-md text-center text-[10px] leading-relaxed text-slate-400">
        Admissibilité selon évaluation médicale. Cette page ne remplace pas un avis médical.
      </p>
    </div>
  );
}
