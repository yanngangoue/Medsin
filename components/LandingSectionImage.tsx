import { HoverZoomImage } from "@/components/ui/HoverZoomImage";

type Aspect = "video" | "four-three";

type LandingSectionImageProps = {
  src: string;
  alt: string;
  aspect?: Aspect;
  className?: string;
};

/**
 * Image de section landing : rounded-2xl, zoom + mouvement au curseur, overlay teal léger.
 */
export function LandingSectionImage({
  src,
  alt,
  aspect = "video",
  className = "",
}: LandingSectionImageProps) {
  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-[4/3]";
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl shadow-sm shadow-slate-200/60 ring-0 ${aspectClass} ${className}`}
    >
      <HoverZoomImage
        src={src}
        alt={alt}
        fill
        zoom="default"
        containerClassName="absolute inset-0 size-full"
        imageClassName="object-cover"
        sizes="(max-width: 1024px) 100vw, 896px"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-tr from-teal-600/12 via-transparent to-white/30"
        aria-hidden
      />
    </div>
  );
}
