'use server';

/**
 * Server Actions for Folder Operations
 * These functions run on the server and handle folder-related API calls
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import type { FolderCardData } from '@/features/quantity-take-off/components/FolderCard';
import type { FolderTableRow } from '@/features/quantity-take-off/components/FolderDetailsTable';

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
        // Clear cookies and redirect to login
        // redirect() throws a special error that Next.js uses for redirects
        // We need to let it propagate, so we call it outside the try-catch
        await handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to load folders: ${response.statusText}`);
    }

    const folders: FolderApiResponse[] = await response.json();

    return folders.map(mapFolderToCardData);
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error &&
      typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Error loading folders:', error);

    return [];
  }
}

/**
 * API Response type for quantity takeoff CSV data endpoint
 */
interface QuantityTakeoffApiResponse {
  items: FolderTableRow[];
  total_material_extension: number;
  total_labor_hours: number;
  final_estimated_bid: number;
}

/**
 * Response type for folder CSV data with summary
 */
export interface FolderCsvDataResult {
  items: FolderTableRow[];
  totalMaterialExtension: number;
  totalLaborHours: number;
  finalEstimatedBid: number;
}

/**
 * Format date from ISO string to M/D/YYYY format for table display
 */
function formatTableDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Parse display date (M/D/YYYY) back to ISO format for API
 * Returns the original string if parsing fails (might already be ISO or invalid)
 */
function parseTableDateToISO(dateString: string): string {
  if (!dateString) return dateString;

  // If it's already in ISO format (contains 'T' or is a full ISO string), return as-is
  if (dateString.includes('T') || dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateString;
  }

  // Try to parse M/D/YYYY format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      // Create date at noon UTC to avoid timezone issues
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }

  // Return original if parsing fails
  return dateString;
}

export async function loadFolderCsvDataAction(folderId: string): Promise<FolderCsvDataResult> {
  const url = getApiUrl(`/api/quantity_takeoffs/folder/${folderId}`);
  const headers = await getServerAuthHeaders();

  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });
    console.log('Response:', response);
    if (!response.ok) {
      if (response.status === 401) {
        // Clear cookies and redirect to login
        // redirect() throws a special error that Next.js uses for redirects
        // We need to let it propagate, so we call it outside the try-catch
        await handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to load folder data: ${response.statusText}`);
    }

    const data: QuantityTakeoffApiResponse = await response.json();

    // Handle both old format (array) and new format (object with items)
    const items = Array.isArray(data) ? data : (data.items || []);
    const formattedItems = items.map((item: FolderTableRow) => ({
      ...item,
      takeoff_date: formatTableDate(item.takeoff_date)
    }));

    return {
      items: formattedItems,
      totalMaterialExtension: Array.isArray(data) ? 0 : (data.total_material_extension || 0),
      totalLaborHours: Array.isArray(data) ? 0 : (data.total_labor_hours || 0),
      finalEstimatedBid: Array.isArray(data) ? 0 : (data.final_estimated_bid || 0),
    };
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error &&
      typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Error loading folder CSV data:', error);

    return {
      items: [],
      totalMaterialExtension: 0,
      totalLaborHours: 0,
      finalEstimatedBid: 0,
    };
  }
}

/**
 * Upload folder response type
 */
export interface UploadFolderResponse {
  status: boolean;
  message: string;
  folder_id: number;
  folder_name: string;
}

/**
 * Server Action: Upload folder with files
 * @param formData - FormData containing folder_name and files
 * @returns UploadFolderResponse with folder_id and folder_name
 */
export async function uploadFolderAction(formData: FormData): Promise<UploadFolderResponse> {
  const url = getApiUrl('/api/upload-multiple');
  const token = await getServerAuthToken();

  // Create headers without Content-Type to let fetch set it automatically with boundary
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      cache: 'no-store',
    });
    console.log('Response:', response);
    if (!response.ok) {
      if (response.status === 401) {
        // Clear cookies and redirect to login
        // redirect() throws a special error that Next.js uses for redirects
        // We need to let it propagate, so we call it outside the try-catch
        await handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to upload folder: ${response.statusText}`);
    }

    return await response.json() as UploadFolderResponse;
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error &&
      typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Error uploading folder:', error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during folder upload');
  }
}

/**
 * Delete folder response type
 */
export interface DeleteFolderResponse {
  status: boolean;
  message: string;
  folder_id: number;
  deleted_files_count: number;
}

/**
 * Server Action: Delete a folder
 * @param folderId - The ID of the folder to delete
 * @returns DeleteFolderResponse with status and message
 */
export async function deleteFolderAction(folderId: string): Promise<DeleteFolderResponse> {
  const url = getApiUrl(`/api/delete-folder/${folderId}`);
  const headers = await getServerAuthHeaders();

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to delete folder: ${response.statusText}`);
    }

    return await response.json() as DeleteFolderResponse;
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error &&
      typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Error deleting folder:', error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during folder deletion');
  }
}

/**
 * Type for quantity takeoff row update - only id is required, all other fields are optional
 */
export interface QuantityTakeoffUpdateRow {
  id: number;
  description?: string;
  takeoff_date?: string;
  trade_price?: string | number;
  unit?: string;
  discount_percent?: string | number | null;
  link_price?: string | number;
  cost_adjust_percent?: string | number;
  net_cost?: string | number;
  db_labor?: string | number;
  labor?: string | number;
  labor_unit?: string;
  labor_adjust_percent?: string | number;
  total_material?: string | number;
  total_hours?: string | number;
}

/**
 * Update quantity takeoffs response type
 */
export interface UpdateQuantityTakeoffsResponse {
  message: string;
  folder_id: number;
  updated_count: number;
  updated_ids: number[];
  skipped_ids: number[];
  updated_by: string;
}

/**
 * Server Action: Update quantity takeoffs for a folder
 * @param folderId - The ID of the folder
 * @param updates - Array of row updates with id and changed fields
 * @returns UpdateQuantityTakeoffsResponse with update results
 */
export async function updateQuantityTakeoffsAction(
  folderId: string,
  updates: QuantityTakeoffUpdateRow[]
): Promise<UpdateQuantityTakeoffsResponse> {
  const url = getApiUrl(`/api/quantity_takeoffs/${folderId}`);
  const token = await getServerAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Convert takeoff_date from display format (M/D/YYYY) to ISO format for API
    const processedUpdates = updates.map(update => {
      if (update.takeoff_date !== undefined) {
        return {
          ...update,
          takeoff_date: parseTableDateToISO(update.takeoff_date)
        };
      }
      return update;
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(processedUpdates),
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Failed to update quantity takeoffs: ${response.statusText}`);
    }

    return await response.json() as UpdateQuantityTakeoffsResponse;
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error &&
      typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Error updating quantity takeoffs:', error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during quantity takeoff update');
  }
}

// ============================================
// Inference Status Types and Actions
// ============================================

/**
 * Drawing with image URL from inference-results API
 */
export type InferenceDrawing = {
  pdf_name: string;
  image_url: string;
  total_symbols: number;
  symbol_counts: { [key: string]: number };
  legend_colors?: { [key: string]: string };
};

/**
 * Inference results response from /api/inference-results/{folder_id}
 */
export type InferenceResultsResponse = {
  folder_id: number;
  folder_name: string;
  job_id: string;
  status: string;
  total_drawings: number;
  total_symbols: number;
  symbol_counts: { [key: string]: number };
  legend_colors?: { [key: string]: string };
  drawings: InferenceDrawing[];
};

/**
 * Server Action: Get inference results for a folder by ID
 * @param folderId - The folder ID
 * @returns InferenceResultsResponse with drawings and symbol counts
 */
export async function getInferenceResultsAction(folderId: string) {
  const url = getApiUrl(`/api/inference-results/${folderId}`);
  const headers = await getServerAuthHeaders();

  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    console.log('[getInferenceResultsAction] Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized();
      }
      const errorText = await response.text().catch(() => response.statusText);
      console.error('[getInferenceResultsAction] API error:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('[getInferenceResultsAction] Success, drawings:', data.drawings?.length || 0);

    // Return a plain object to ensure serializability
    return {
      folder_id: data.folder_id,
      folder_name: data.folder_name,
      job_id: data.job_id,
      status: data.status,
      total_drawings: data.total_drawings,
      total_symbols: data.total_symbols,
      symbol_counts: data.symbol_counts,
      drawings: data.drawings,
    };
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error &&
      typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('[getInferenceResultsAction] Error:', error);

    return null;
  }
}

/**
 * Inference job status response
 */
export interface InferenceStatusResponse {
  folder_name: string;
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  total_drawings: number;
  total_symbols: number;
  created_at: string;
  completed_at: string | null;
  error: string | null;
}

/**
 * Server Action: Get inference job status for a folder
 * @param folderName - The name of the folder
 * @returns InferenceStatusResponse with job status
 */
export async function getInferenceStatusAction(folderName: string): Promise<InferenceStatusResponse> {
  const url = getApiUrl(`/api/inference/status/${encodeURIComponent(folderName)}`);
  console.log('[getInferenceStatusAction] Fetching status for:', folderName, '| URL:', url);

  const headers = await getServerAuthHeaders();

  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    console.log('[getInferenceStatusAction] Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      console.error('[getInferenceStatusAction] API error:', errorData);
      throw new Error(errorData.detail || `Failed to get inference status: ${response.statusText}`);
    }

    const data = await response.json() as InferenceStatusResponse;
    console.log('[getInferenceStatusAction] Status data:', data);

    return data;
  } catch (error) {
    // Check if this is a Next.js redirect error - if so, re-throw it
    if (error && typeof error === 'object' && 'digest' in error &&
      typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('[getInferenceStatusAction] Error:', error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while getting inference status');
  }
}
