export interface FileItem {
  name: string;
  slug: string;
  path: string;
  folder: string;
  size: number;
  last_modified: string;
  item_type: 'file';
}

export interface FolderItem {
  name: string;
  slug: string;
  path: string;
  item_type: 'folder';
}

export type DashboardItem = FileItem | FolderItem;

export interface StructureResponse {
  items: DashboardItem[];
  total: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

export interface ConfigResponse {
  storage_type: string;
  bucket?: string;
}

export interface UploadProgress {
  type: 'progress' | 'complete' | 'error' | 'pong';
  message: string;
  progress?: number;
}

export interface TrackingResponse {
  headers: string[];
  rows: Record<string, string | number>[];
  total: number;
}

export interface DeleteResponse {
  message: string;
}

