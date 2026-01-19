'use client';

import Image from 'next/image';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FolderCardData {
  id: string;
  name: string;
  date: string;
  size: string;
  isNew?: boolean;
}

interface FolderCardProps {
  folder: FolderCardData;
  onCardClick?: (folder: FolderCardData) => void;
  onMenuClick?: (folder: FolderCardData) => void;
}

export default function FolderCard({ folder, onCardClick, onMenuClick }: FolderCardProps) {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow relative cursor-pointer"
      onClick={() => onCardClick?.(folder)}
    >
      {/* New Badge */}
      {folder.isNew && (
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded">
          New
        </span>
      )}

      {/* Folder Icon */}
      <div className="flex justify-center mb-3 mt-2">
        <div className="relative w-12 h-12">
          <Image
            src="/folder.svg"
            alt="Folder icon"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Folder Name */}
      <div>
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-10">
          {folder.name}
        </h3>
        
        {/* Date and Size */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>{folder.date}</p>
          <p>{folder.size}</p>

        </div>
      </div>
          <div className="absolute bottom-2 right-2">
          <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick?.(folder);
          }}
        >
            <MoreVertical className="h-4 w-4 text-gray-600" />
        </Button>
          </div>
    </div>
  );
}

