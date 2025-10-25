/**
 * Image Optimization Utilities
 * Lazy loading and responsive image handling
 */

/**
 * Get optimized image URL with width parameter
 * Works with services that support URL-based resizing
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return '';
  
  // If it's already a data URL or blob, return as-is
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  
  // For Unsplash images, add width parameter
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return width ? `${url}${separator}w=${width}&q=80&fm=webp` : `${url}${separator}q=80&fm=webp`;
  }
  
  // For other images, return as-is (could add more services here)
  return url;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(url: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
  return widths
    .map(width => `${getOptimizedImageUrl(url, width)} ${width}w`)
    .join(', ');
}

/**
 * Get appropriate sizes attribute based on layout
 */
export function getImageSizes(layout: 'full' | 'half' | 'third' | 'card' = 'card'): string {
  const sizeMap = {
    full: '100vw',
    half: '(min-width: 768px) 50vw, 100vw',
    third: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
    card: '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw'
  };
  
  return sizeMap[layout];
}

/**
 * Lazy load image with IntersectionObserver
 */
export function lazyLoadImage(img: HTMLImageElement) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        const src = target.dataset.src;
        const srcset = target.dataset.srcset;
        
        if (src) {
          target.src = src;
        }
        if (srcset) {
          target.srcset = srcset;
        }
        
        target.classList.remove('lazy');
        observer.unobserve(target);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  observer.observe(img);
}

/**
 * Preload critical images
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Get blurhash placeholder
 * Returns a small base64 encoded placeholder
 */
export function getBlurhashPlaceholder(): string {
  // Simple gray placeholder
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3C/svg%3E';
}

/**
 * Check if image is in viewport
 */
export function isImageInViewport(img: HTMLImageElement): boolean {
  const rect = img.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

