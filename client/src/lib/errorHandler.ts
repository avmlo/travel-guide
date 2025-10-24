/**
 * Centralized error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', 0, details);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Handle API errors and convert them to AppError instances
 */
export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return new NetworkError('Network connection failed', error);
    }
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return new AuthError('Authentication required', error);
    }
    
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return new NotFoundError('Resource not found', error);
    }
    
    if (error.message.includes('400') || error.message.includes('Bad Request')) {
      return new ValidationError('Invalid request', error);
    }

    return new AppError(error.message, 'UNKNOWN_ERROR', 500, error);
  }

  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500, error);
}

/**
 * Log error with appropriate level
 */
export function logError(error: AppError, context?: string): void {
  const logMessage = context 
    ? `[${context}] ${error.name}: ${error.message}`
    : `${error.name}: ${error.message}`;

  if (error.statusCode >= 500) {
    console.error(logMessage, error.details);
  } else if (error.statusCode >= 400) {
    console.warn(logMessage, error.details);
  } else {
    console.log(logMessage, error.details);
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect to the server. Please check your internet connection.';
    case 'AUTH_ERROR':
      return 'Please sign in to continue.';
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.';
    default:
      return 'Something went wrong. Please try again later.';
  }
}

/**
 * Error boundary helper for React components
 */
export function handleComponentError(error: unknown, errorInfo?: { componentStack: string }): AppError {
  const appError = handleApiError(error);
  
  if (errorInfo) {
    logError(appError, `Component Error: ${errorInfo.componentStack}`);
  } else {
    logError(appError, 'Component Error');
  }
  
  return appError;
}