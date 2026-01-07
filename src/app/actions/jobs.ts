'use server';

/**
 * Server Actions for Jobs Operations
 * These functions run on the server and handle jobs-related API calls
 */

import { cookies } from 'next/headers';
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
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to load jobs: ${response.statusText}`);
    }

    return await response.json() as Job[];
  } catch (error) {
    console.error('Error loading jobs:', error);
    
    return [];
  }
}
