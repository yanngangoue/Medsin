import Image, { type ImageProps } from "next/image";

type ZoomStrength = "subtle" | "default" | "strong";

/** Zoom quand le curseur est sur le conteneur image. */
const CONTAINER_HOVER_ZOOM: Record<ZoomStrength, string> = {
  subtle: "hover:[&_img]:scale-105",
  default: "hover:[&_img]:scale-110",
  strong: "hover:[&_img]:scale-[1.14]",
};

/** Zoom quand un ancêtre a la classe `group` (ex. carte cliquable entière). */
const GROUP_HOVER_ZOOM: Record<ZoomStrength, string> = {
  subtle: "group-hover:[&_img]:scale-105",
  default: "group-hover:[&_img]:scale-110",
  strong: "group-hover:[&_img]:scale-[1.14]",
};

type Props = ImageProps & {
  containerClassName?: string;
  imageClassName?: string;
  zoom?: ZoomStrength;
  /** Activer le zoom au survol d’un parent `.group` (cartes lien, etc.). */
  groupHover?: boolean;
};

/**
 * Image avec zoom fluide au survol (style MEDVi).
 * Le zoom cible l’élément img rendu par next/image (y compris dans un span).
 */
export function HoverZoomImage({
  containerClassName = "",
  imageClassName = "",
  zoom = "default",
  groupHover = false,
  alt,
  className,
  ...imageProps
}: Props) {
  const mergedImageClass = [
    "transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none motion-reduce:hover:scale-100",
    imageClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`relative cursor-default overflow-hidden ${CONTAINER_HOVER_ZOOM[zoom]} ${groupHover ? GROUP_HOVER_ZOOM[zoom] : ""} ${containerClassName}`}
      data-hover-zoom=""
    >
      <Image alt={alt} className={mergedImageClass} {...imageProps} />
    </div>
  );
}
