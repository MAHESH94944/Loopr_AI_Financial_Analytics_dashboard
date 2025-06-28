// Debug utility to help troubleshoot authentication issues

interface User {
  _id?: string;
  email?: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  config?: {
    url?: string;
  };
}

export const debugAuth = {
  // Log authentication status
  logAuthState: (user: User | null, loading: boolean) => {
    console.log("Auth State:", {
      isAuthenticated: !!user,
      userID: user?._id,
      loading,
    });
  },

  // Log API errors with more detail
  logApiError: (error: unknown, context: string) => {
    console.group(`API Error - ${context}`);
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as ApiError;
      console.log("Status:", apiError.response?.status);
      console.log("Message:", apiError.response?.data?.message);
      console.log("URL:", apiError.config?.url);
    } else {
      console.log("Error:", error);
    }
    console.groupEnd();
  },

  // Check if cookies are being sent
  checkCookies: () => {
    console.log("Document cookies:", document.cookie);
  },
};

// Add to window for debugging in browser console
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).debugAuth = debugAuth;
}
