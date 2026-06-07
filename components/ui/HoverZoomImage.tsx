import Image, { type ImageProps } from "next/image";

type ZoomStrength = "subtle" | "default" | "strong";

const CONTAINER_HOVER_ZOOM: Record<ZoomStrength, string> = {
  subtle: "hover:[&_img]:scale-105",
  default: "hover:[&_img]:scale-110",
  strong: "hover:[&_img]:scale-[1.14]",
};

const GROUP_HOVER_ZOOM: Record<ZoomStrength, string> = {
  subtle: "group-hover:[&_img]:scale-105",
  default: "group-hover:[&_img]:scale-110",
  strong: "group-hover:[&_img]:scale-[1.14]",
};

type Props = ImageProps & {
  containerClassName?: string;
  imageClassName?: string;
  zoom?: ZoomStrength;
  groupHover?: boolean;
  clickable?: boolean;
};

export function HoverZoomImage({
  containerClassName = "",
  imageClassName = "",
  zoom = "default",
  groupHover = false,
  clickable = false,
  alt,
  className,
  fill,
  ...imageProps
}: Props) {
  const isLocal = typeof imageProps.src === "string" && imageProps.src.startsWith("/");

  const mergedImageClass = [
    "transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none motion-reduce:hover:scale-100",
    imageClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`relative overflow-hidden ${clickable ? "cursor-pointer" : "cursor-default"} ${fill ? "[&>span]:!absolute [&>span]:!inset-0 [&>span]:!block [&>span]:!size-full" : ""} ${CONTAINER_HOVER_ZOOM[zoom]} ${groupHover ? GROUP_HOVER_ZOOM[zoom] : ""} ${containerClassName}`}
      data-hover-zoom=""
    >
      <Image
        alt={alt}
        className={mergedImageClass}
        fill={fill}
        unoptimized={imageProps.unoptimized ?? isLocal}
        {...imageProps}
      />
    </div>
  );
}
