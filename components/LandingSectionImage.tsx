import Image from "next/image";

type Aspect = "video" | "four-three";

type LandingSectionImageProps = {
  src: string;
  alt: string;
  aspect?: Aspect;
  className?: string;
};

/**
 * Image de section landing : rounded-2xl, object-cover, overlay teal léger (style Medvi).
 * Pas de priority → chargement lazy par défaut (next/image).
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
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 896px"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-teal-600/12 via-transparent to-white/30"
        aria-hidden
      />
    </div>
  );
}
