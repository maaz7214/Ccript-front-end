'use client';

import { Folder, File, Trash2, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardItem } from '@/types/dashboard';

interface FolderListProps {
  items: DashboardItem[];
  onItemClick?: (item: DashboardItem) => void;
  onDelete?: (item: DashboardItem) => void;
  searchQuery?: string;
  deletingItemPath?: string | null;
  isDeleting?: boolean;
}

export default function FolderList({ items, onItemClick, onDelete, searchQuery, deletingItemPath, isDeleting }: FolderListProps) {
  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (items.length === 0) {
    const emptyMessage = searchQuery?.trim() 
      ? `No items match "${searchQuery}"`
      : 'This folder is empty';
    const emptyHint = searchQuery?.trim()
      ? 'Try a different search term'
      : 'Upload a folder to get started';

    return (
      <div className="text-center py-20 text-gray-500">
        <Folder className="h-20 w-20 text-gray-300 mx-auto mb-4 opacity-50" />
        <p className="text-lg mb-2">{emptyMessage}</p>
        <p className="text-sm text-gray-400">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[40px_1fr_100px] gap-4 bg-gray-50 px-5 py-3 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
        <div></div>
        <div>Name</div>
        {/* <div className="hidden md:block">Size</div> */}
        {/* <div className="hidden lg:block">Modified</div> */}
        <div className="text-right">Actions</div>
      </div>

      {/* Items */}
      <div>
        {items.map((item) => {
          const isFolder = item.item_type === 'folder';
          
          return (
            <div
              key={item.path}
              className={`grid grid-cols-[40px_1fr_100px] gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                isFolder ? ' hover:bg-gray-50' : ''
              }`}
            >
              {/* Icon */}
              <div className="flex items-center justify-center text-2xl">
                {isFolder ? (
                  <Folder className="h-7 w-7 text-[#009689]" />
                ) : (
                  <File className="h-6 w-6 text-gray-500" />
                )}
              </div>

              {/* Name and Slug */}
              <div 
                className="flex flex-col gap-1 cursor-pointer"
                onClick={() => onItemClick?.(item)}
              >
                <div className="font-semibold text-gray-900 text-sm">
                  {item.name}
                </div>
                <div className="text-xs font-mono bg-teal-100 text-[#009689] px-2 py-1 rounded inline-block w-fit">
                  {item.slug}
                </div>
              </div>

              {/* Size - Commented out */}
              {/* <div className="hidden md:flex items-center text-sm text-gray-600">
                {isFolder ? '-' : formatFileSize((item as any).size || 0)}
              </div> */}

              {/* Modified Date - Commented out */}
              {/* <div className="hidden lg:flex items-center text-xs text-gray-600">
                {isFolder ? '-' : formatDate((item as any).last_modified || new Date().toISOString())}
              </div> */}

              {/* Actions and Arrow */}
              <div className="flex items-center justify-end gap-2">
                {isFolder && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(item);
                  }}
                  disabled={isDeleting && deletingItemPath === item.path}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting && deletingItemPath === item.path ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}