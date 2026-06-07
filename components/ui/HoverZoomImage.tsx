"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type ZoomStrength = "subtle" | "default" | "strong";

const ZOOM_SCALE: Record<ZoomStrength, number> = {
  subtle: 1.05,
  default: 1.1,
  strong: 1.14,
};

type Props = ImageProps & {
  containerClassName?: string;
  imageClassName?: string;
  zoom?: ZoomStrength;
  /** Déplacement léger de l'image suivant la position du curseur. */
  followCursor?: boolean;
  groupHover?: boolean;
  clickable?: boolean;
};

export function HoverZoomImage({
  containerClassName = "",
  imageClassName = "",
  zoom = "default",
  followCursor = true,
  groupHover = false,
  clickable = false,
  alt,
  className,
  fill,
  ...imageProps
}: Props) {
  const isLocal = typeof imageProps.src === "string" && imageProps.src.startsWith("/");
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [groupActive, setGroupActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!groupHover || !containerRef.current) return;
    const groupEl = containerRef.current.closest(".group");
    if (!groupEl) return;

    const onOver = () => setGroupActive(true);
    const onOut = (e: MouseEvent) => {
      const next = e.relatedTarget;
      if (next instanceof Node && groupEl.contains(next)) return;
      setGroupActive(false);
    };

    groupEl.addEventListener("mouseover", onOver);
    groupEl.addEventListener("mouseout", onOut);
    return () => {
      groupEl.removeEventListener("mouseover", onOver);
      groupEl.removeEventListener("mouseout", onOut);
    };
  }, [groupHover]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!followCursor) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setOffset({ x: x * 8, y: y * 8 });
    },
    [followCursor],
  );

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  const scale = hovered || groupActive ? ZOOM_SCALE[zoom] : 1;
  const transform = `translate(${offset.x}%, ${offset.y}%) scale(${scale})`;

  const mergedImageClass = [
    "transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none motion-reduce:!transform-none",
    imageClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${clickable ? "cursor-pointer" : "cursor-default"} ${fill ? "[&>span]:!absolute [&>span]:!inset-0 [&>span]:!block [&>span]:!size-full [&_img]:size-full" : ""} ${containerClassName}`}
      data-hover-zoom=""
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <Image
        alt={alt}
        className={mergedImageClass}
        fill={fill}
        style={{ transform }}
        unoptimized={imageProps.unoptimized ?? isLocal}
        {...imageProps}
      />
    </div>
  );
}
