/**
 * API Configuration and utility functions
 * This file centralizes all API-related configuration and provides
 * reusable functions for making API requests across the application.
 */

/**
 * Get the API base URL from environment variables
 * This function performs a lazy check to avoid build-time errors
 * @returns The API base URL
 * @throws Error if NEXT_PUBLIC_API_BASE_URL is not defined
 */
function getApiBaseUrl(): string {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables. Please set it in your .env.local file or Vercel environment variables');
  }
  
  return API_BASE_URL;
}

/**
 * API Configuration object containing common headers
 * Base URL is retrieved lazily to avoid build-time errors
 */
export const apiConfig = {
  headers: {
    'Content-Type': 'application/json',
    // Add ngrok-skip-browser-warning header to bypass ngrok browser warning
    'ngrok-skip-browser-warning': 'true',
  },
} as const;

/**
 * API endpoints configuration
 * Add new endpoints here as you integrate more APIs
 */
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
  },
  // Add more endpoint categories here as needed
  // user: {
  //   profile: '/api/user/profile',
  //   update: '/api/user/update',
  // },
} as const;

/**
 * Utility function to construct full API URLs
 * @param endpoint - The API endpoint (e.g., '/api/auth/login')
 * @returns Full URL for the API endpoint
 */
export function getApiUrl(endpoint: string): string {
  // Get base URL lazily to avoid build-time errors
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Generic API request function with error handling
 * @param endpoint - API endpoint
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with the API response
 */
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  console.log('Making API request to URL:', url);
  console.log('Request options:', options);
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok
    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response isn't JSON, use the status text
      }
      throw new Error(errorMessage);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw with more context if needed
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during API request');
  }
}

/**
 * Convenience function for GET requests
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * Convenience function for POST requests
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Convenience function for PUT requests
 */
export async function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Convenience function for DELETE requests
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}