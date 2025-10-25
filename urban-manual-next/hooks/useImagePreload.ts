import { useState, useEffect } from "react";

export function useImagePreload(src: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();

    img.onload = () => {
      setIsLoaded(true);
      setError(false);
    };

    img.onerror = () => {
      setIsLoaded(false);
      setError(true);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { isLoaded, error };
}
