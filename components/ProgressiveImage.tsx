import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  aspectRatio?: string;
  onLoad?: () => void;
}

export function ProgressiveImage({
  src,
  alt,
  className,
  placeholderClassName,
  aspectRatio = "square",
  onLoad,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setIsLoaded(true);
      setError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder with shimmer effect */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
          "animate-shimmer bg-[length:200%_100%]",
          "transition-opacity duration-500",
          isLoaded && "opacity-0",
          placeholderClassName
        )}
      />

      {/* Actual image */}
      {!error && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover",
            "transition-all duration-500",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          loading="lazy"
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-400 dark:text-gray-600 text-center">
            <svg
              className="h-8 w-8 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}
