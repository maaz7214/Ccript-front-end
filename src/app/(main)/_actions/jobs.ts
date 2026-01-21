'use server';

/**
 * Server Actions for Jobs Operations
 * These functions run on the server and handle jobs-related API calls
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import type { Job } from '@/types/jobs';

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
 * Server Action: Load jobs list
 * @returns Array of Job objects (API response format)
 */
export async function loadJobsAction(): Promise<Job[]> {
  const url = getApiUrl('/api/jobs');
  const headers = await getServerAuthHeaders();

  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });
   console.log('response', response);
    if (!response.ok) {
      if (response.status === 401) {
        // Clear cookies and redirect to login
        // redirect() throws a special error that Next.js uses for redirects
        // We need to let it propagate, so we call it outside the try-catch
        await handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to load jobs: ${response.statusText}`);
    }

    return await response.json() as Job[];
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('Error loading jobs:', error);
    
    return [];
  }
}
