/**
 * Image Component
 * Renders images with lazy loading and skeleton placeholder
 */

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ImageProps {
  src: string;
  alt: string;
  aspect?: "square" | "video" | "wide" | "portrait";
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  sizes?: string;
  className?: string;
}

export function Image({
  src,
  alt,
  aspect = "video",
  lazy = true,
  placeholder,
  fallback,
  sizes,
  className,
}: ImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    portrait: "aspect-[3/4]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md",
        aspectClasses[aspect]
      )}
    >
      {loading && <Skeleton className="absolute inset-0" />}
      <img
        src={error && fallback ? fallback : src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        sizes={sizes}
        className={cn(
          "h-full w-full object-cover transition-opacity",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}
