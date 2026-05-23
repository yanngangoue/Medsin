import Image, { type ImageProps } from "next/image";

/** Images locales /public — `unoptimized` évite les images cassées avec next/image. */
export function NutriPlusImage({ src, alt, ...props }: ImageProps) {
  const isLocal = typeof src === "string" && src.startsWith("/");
  return <Image src={src} alt={alt} unoptimized={isLocal} {...props} />;
}
