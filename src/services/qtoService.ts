import { getApiUrl } from '@/lib/api';
import type { FolderCardData } from '@/features/quantity-take-off/components/FolderCard';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Handle authentication errors (401 Unauthorized)
 * Clears localStorage and redirects to login
 */
function handleAuthError(): void {
  if (typeof window === 'undefined') return;
  
  // Clear authentication data
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  
  // Redirect to login page
  window.location.href = '/login';
}

/**
 * Get auth headers for API requests
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Handle API response and check for authentication errors
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  // Check for 401 Unauthorized (token expired or invalid)
  if (response.status === 401) {
    handleAuthError();
    const errorData = await response.json().catch(() => ({ detail: 'Could not validate credentials' }));
    throw new Error(errorData.detail || 'Session expired. Please login again.');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Upload folder API response type
 */
export interface UploadFolderResponse {
  status: boolean;
  message: string;
  folder_id: number;
  folder_name: string;
}

/**
 * Upload folder with files
 * @param folderName - Name of the folder
 * @param files - FileList or array of files to upload
 * @returns UploadFolderResponse with folder_id and folder_name
 */
export async function uploadFolder(
  folderName: string,
  files: FileList | File[]
): Promise<UploadFolderResponse> {
  const formData = new FormData();
  
  // Append folder_name
  formData.append('folder_name', folderName);
  
  // Append all files
  const filesArray = files instanceof FileList ? Array.from(files) : files;
  filesArray.forEach(file => {
    formData.append('files', file);
  });

  const url = getApiUrl('/api/upload-multiple');
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleApiResponse<UploadFolderResponse>(response);
}

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
 * Check if folder was uploaded within last 24 hours
 */
function isRecentlyUploaded(dateString: string): boolean {
  const uploadDate = new Date(dateString);
  const now = new Date();
  const hoursDiff = (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 24;
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
    isNew: isRecentlyUploaded(folder.upload_date || folder.created_at),
  };
}

/**
 * Load folder list from API (client-side)
 * @returns Array of FolderCardData
 */
export async function loadFolders(): Promise<FolderCardData[]> {
  const url = getApiUrl('/api/folder-list');
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
      throw new Error('Session expired. Please login again.');
    }
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed to load folders: ${response.statusText}`);
  }

  const folders: FolderApiResponse[] = await response.json();
  return folders.map(mapFolderToCardData);
}

