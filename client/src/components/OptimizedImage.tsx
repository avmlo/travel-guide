import { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl, generateSrcSet, getImageSizes, getBlurhashPlaceholder } from '@/lib/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  layout?: 'full' | 'half' | 'third' | 'card';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  layout = 'card',
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const dataSrc = img.dataset.src;
            const dataSrcset = img.dataset.srcset;

            if (dataSrc) {
              img.src = dataSrc;
            }
            if (dataSrcset) {
              img.srcset = dataSrcset;
            }

            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-xs text-gray-400">Image unavailable</span>
      </div>
    );
  }

  const optimizedSrc = getOptimizedImageUrl(src);
  const srcSet = generateSrcSet(src);
  const sizes = getImageSizes(layout);

  if (priority) {
    // For priority images, load immediately
    return (
      <img
        ref={imgRef}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="eager"
      />
    );
  }

  // For lazy-loaded images
  return (
    <img
      ref={imgRef}
      src={getBlurhashPlaceholder()}
      data-src={optimizedSrc}
      data-srcset={srcSet}
      sizes={sizes}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  );
}

