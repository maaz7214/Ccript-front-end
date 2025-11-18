import { getApiUrl } from '@/lib/api';
import type { StructureResponse, ConfigResponse, TrackingResponse, DeleteResponse, UploadProgress } from '@/types/dashboard';

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
 * Load file/folder structure from API
 */
export async function loadStructure(
  page: number = 1,
  limit: number = 50,
  search: string = ''
): Promise<StructureResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search,
  });

  const url = getApiUrl(`/api/structure?${params}`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse<StructureResponse>(response);
}

/**
 * Load configuration (storage type, bucket, etc.)
 */
export async function loadConfig(): Promise<ConfigResponse> {
  const url = getApiUrl('/api/config');
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse<ConfigResponse>(response);
}

/**
 * Upload multiple files with progress tracking
 */
export async function uploadFiles(
  files: File[],
  paths: string[],
  clientId: string
): Promise<{ message: string }> {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  formData.append('paths', JSON.stringify(paths));
  formData.append('client_id', clientId);

  const url = getApiUrl('/api/upload-multiple');
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleApiResponse<{ message: string }>(response);
}

/**
 * Delete a file or folder
 */
export async function deleteItem(
  path: string,
  type: 'file' | 'folder'
): Promise<DeleteResponse> {
  const endpoint = type === 'folder' ? `/api/folders/${path}` : `/api/files/${path}`;
  const url = getApiUrl(endpoint);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiResponse<DeleteResponse>(response);
}

/**
 * Load tracking data (CSV)
 */
export async function loadTracking(search: string = ''): Promise<TrackingResponse> {
  const params = new URLSearchParams({
    search: search,
  });

  const url = getApiUrl(`/api/tracking?${params}`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse<TrackingResponse>(response);
}

/**
 * Create WebSocket connection for upload progress
 * Returns a Promise that resolves when the WebSocket is connected
 */
export function createUploadWebSocket(
  clientId: string,
  onMessage: (data: UploadProgress) => void,
  onError?: (error: Event) => void
): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    
    // Extract host from base URL (remove http:// or https://)
    // If baseUrl is not set, use window.location.host (like in reference)
    let host: string;
    if (baseUrl) {
      host = baseUrl.replace(/^https?:\/\//, '');
    } else {
      host = window.location.host;
    }
    
    const wsUrl = `${protocol}//${host}/ws/${clientId}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      resolve(ws);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
      reject(error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
  });
}

/**
 * Generate unique client ID for WebSocket
 */
export function generateClientId(): string {
  return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

