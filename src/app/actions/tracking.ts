'use server';

/**
 * Server Actions for Tracking Operations
 * These functions run on the server and handle tracking-related API calls
 */

import { cookies } from 'next/headers';
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
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to load tracking data: ${response.statusText}`);
    }

    return await response.json() as TrackingResponse;
  } catch (error) {
    console.error('Error loading tracking data:', error);
    
    // Return empty data structure on error
    return {
      headers: [],
      rows: [],
      total: 0,
    };
  }
}

