'use server';

/**
 * Server Actions for Tracking Operations
 * These functions run on the server and handle tracking-related API calls
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import type { TrackingResponse } from '@/types/dashboard';

/**
 * Get auth token from cookies (server-side)
 */
async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}

/**
 * Get auth headers for API requests (server-side)
 */
async function getServerAuthHeaders(): Promise<HeadersInit> {
  const token = await getServerAuthToken();
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Handle 401 Unauthorized errors by redirecting to login
 * Note: Cookies cannot be modified when called from Server Components,
 * so we redirect to login page where cookies can be cleared if needed.
 * The cookies are already invalid (that's why we got 401), so they're harmless.
 */
async function handleUnauthorized(): Promise<never> {
  // Redirect to login page
  // Cookies will be cleared when user logs in again or can be handled on login page
  redirect('/login');
}

/**
 * Server Action: Load tracking data
 * @param search - Search query string
 * @returns TrackingResponse with headers, rows, and total count
 */
export async function loadTrackingAction(search: string = ''): Promise<TrackingResponse> {
  const params = new URLSearchParams();
  if (search) {
    params.set('search', search);
  }

  const url = getApiUrl(`/api/tracking?${params.toString()}`);
  const headers = await getServerAuthHeaders();

  try {
    const response = await fetch(url, {
      headers,
      // Disable Next.js caching to always get fresh data
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear cookies and redirect to login
        // redirect() throws a special error that Next.js uses for redirects
        // We need to let it propagate, so we call it outside the try-catch
        await handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to load tracking data: ${response.statusText}`);
    }

    return await response.json() as TrackingResponse;
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('Error loading tracking data:', error);
    
    // Return empty data structure on error
    return {
      headers: [],
      rows: [],
      total: 0,
    };
  }
}

