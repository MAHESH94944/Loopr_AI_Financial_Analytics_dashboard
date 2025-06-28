// Utility functions for handling errors consistently across the app

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const isNetworkError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  // Check if it's a network error (no response from server)
  const apiError = error as ApiError;
  return !apiError.response && !!apiError.message;
};

export const isUnauthorizedError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  const apiError = error as ApiError;
  return apiError.response?.status === 401;
};

export const getErrorMessage = (
  error: unknown,
  defaultMessage = "An error occurred"
): string => {
  if (!error || typeof error !== "object") return defaultMessage;

  const apiError = error as ApiError;

  // Check for API error message
  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }

  // Check for general error message
  if (apiError.message) {
    return apiError.message;
  }

  return defaultMessage;
};

export const shouldLogError = (error: unknown): boolean => {
  // Don't log 401 errors as they are expected when not authenticated
  return !isUnauthorizedError(error);
};
