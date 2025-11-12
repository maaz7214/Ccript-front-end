'use client';

import { Folder, ChevronRight, File } from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
}

interface FolderListProps {
  folders: FolderItem[];
  onFolderClick?: (folder: FolderItem) => void;
}

export default function FolderList({ folders, onFolderClick }: FolderListProps) {
  return (
    <div className="space-y-2">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onFolderClick?.(folder)}
        >
          {/* Left side: Icon and name */}
          <div className="flex items-center gap-3">
            {folder.type === 'folder' ? (
              <Folder className="h-5 w-5 text-[#009689]" />
            ) : (
              <File className="h-5 w-5 text-[#009689]" />
            )}
            <span className="text-sm font-medium text-gray-900">{folder.name}</span>
          </div>
          
          {/* Right side: Arrow icon only for folders */}
          {folder.type === 'folder' && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      ))}
      
      {/* Empty state */}
      {folders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Folder className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">No files or folders found</p>
        </div>
      )}
    </div>
  );
}