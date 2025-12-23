'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import FolderCard, { type FolderCardData } from './FolderCard';

interface FolderGridProps {
  folders: FolderCardData[];
  onFolderClick?: (folder: FolderCardData) => void;
  onMenuClick?: (folder: FolderCardData) => void;
}

export default function FolderGrid({ folders, onFolderClick, onMenuClick }: FolderGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter folders based on search query
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* All Folders Header with Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">All Folders</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Folder"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Folder Grid */}
      {filteredFolders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">
            {searchQuery ? `No folders match "${searchQuery}"` : 'No folders yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? 'Try a different search term' : 'Upload a folder to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onCardClick={onFolderClick}
              onMenuClick={onMenuClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

