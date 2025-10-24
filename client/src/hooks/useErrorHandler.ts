import { useCallback } from 'react';
import { toast } from 'sonner';
import { handleApiError, logError, getUserFriendlyMessage, AppError } from '@/lib/errorHandler';

/**
 * Custom hook for handling errors consistently across the application
 */
export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    const appError = handleApiError(error);
    logError(appError, context);
    
    // Show user-friendly message
    const userMessage = getUserFriendlyMessage(appError);
    toast.error(userMessage);
    
    return appError;
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  const handleErrorWithFallback = useCallback(<T>(
    error: unknown,
    fallback: T,
    context?: string
  ): T => {
    handleError(error, context);
    return fallback;
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    handleErrorWithFallback,
  };
}