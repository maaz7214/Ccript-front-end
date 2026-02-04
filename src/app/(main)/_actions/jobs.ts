'use server';

/**
 * Server Actions for Jobs Operations
 * These functions run on the server and handle jobs-related API calls
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import type { Job, JobsListApiResponse } from '@/types/jobs';

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
 * @param searchQuery Optional search query to filter jobs by folder name
 * @returns Array of Job objects (API response format)
 */
export async function loadJobsAction(searchQuery?: string): Promise<Job[]> {
  let url = getApiUrl('/api/jobs');
  
  // Add search query parameter if provided
  if (searchQuery && searchQuery.trim()) {
    const params = new URLSearchParams({ q: searchQuery.trim() });
    url += `?${params.toString()}`;
  }
  
  const headers = await getServerAuthHeaders();

  try {
    console.log('=== Server: Fetching Jobs ===');
    console.log('URL:', url);
    console.log('Search Query:', searchQuery || '(none)');
    
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });
    
    console.log('Response Status:', response.status);
    
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

    const data = await response.json();
    
    // Handle new response structure with total_count and jobs array
    const jobs = (data as JobsListApiResponse).jobs || (Array.isArray(data) ? data : []);
    
    console.log('Jobs loaded successfully:', jobs.length, 'jobs');
    console.log('Total Count:', (data as JobsListApiResponse).total_count || jobs.length);
    console.log('============================');
    
    return jobs;
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
