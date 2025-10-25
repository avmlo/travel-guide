import { useState, useCallback } from "react";

interface UseOptimisticOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  revertOnError?: boolean;
}

export function useOptimistic<T = any>(
  initialState: T,
  options: UseOptimisticOptions<T> = {}
) {
  const { onSuccess, onError, revertOnError = true } = options;
  const [state, setState] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (
      optimisticValue: T,
      asyncFn: () => Promise<T>
    ): Promise<T | undefined> => {
      const previousState = state;

      // Immediately update to optimistic value
      setState(optimisticValue);
      setIsLoading(true);

      try {
        const result = await asyncFn();
        setState(result);
        onSuccess?.(result);
        return result;
      } catch (error) {
        // Revert to previous state on error
        if (revertOnError) {
          setState(previousState);
        }
        onError?.(error as Error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [state, onSuccess, onError, revertOnError]
  );

  return { state, setState, execute, isLoading };
}
