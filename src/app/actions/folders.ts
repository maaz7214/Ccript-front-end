'use server';

/**
 * Server Actions for Folder Operations
 * These functions run on the server and handle folder-related API calls
 */

import { cookies } from 'next/headers';
import { getApiUrl } from '@/lib/api';
import type { FolderCardData } from '@/features/quantity-take-off/components/FolderCard';
import { redirect } from 'next/dist/server/api-utils';

/**
 * API Response type for folder list endpoint
 */
interface FolderApiResponse {
  id: number;
  folder_name: string;
  upload_date: string;
  size: number;
  uploaded_by: string;
  created_at: string;
  files: unknown[];
}

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
 * Format file size from bytes to human-readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)}${sizes[i]}`;
}

/**
 * Format date from ISO string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Map API response to FolderCardData format
 */
function mapFolderToCardData(folder: FolderApiResponse): FolderCardData {
  return {
    id: folder.id.toString(),
    name: folder.folder_name,
    date: formatDate(folder.upload_date || folder.created_at),
    size: formatFileSize(folder.size),
    // Optionally mark as new if uploaded within last 24 hours
    isNew: isRecentlyUploaded(folder.upload_date || folder.created_at),
  };
}

/**
 * Check if folder was uploaded within last 24 hours
 */
function isRecentlyUploaded(dateString: string): boolean {
  const uploadDate = new Date(dateString);
  const now = new Date();
  const hoursDiff = (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 24;
}

/**
 * Server Action: Load folder list
 * @returns Array of FolderCardData
 */
export async function loadFoldersAction(): Promise<FolderCardData[]> {
  const url = getApiUrl('/api/folder-list');
  const headers = await getServerAuthHeaders();

  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to load folders: ${response.statusText}`);
    }

    const folders: FolderApiResponse[] = await response.json();
    
    return folders.map(mapFolderToCardData);
  } catch (error) {
    console.error('Error loading folders:', error);
    
    return [];
  }
}

