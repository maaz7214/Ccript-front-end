'use client';

import Image from 'next/image';
import FolderMenu from './FolderMenu';

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
  onDelete?: (folder: FolderCardData) => void;
}

export default function FolderCard({ folder, onCardClick, onDelete }: FolderCardProps) {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow relative cursor-pointer"
      onClick={() => onCardClick?.(folder)}
    >
      {/* New Badge */}
      {folder.isNew && (
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded z-10">
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

      {/* Menu Button */}
      <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
        <FolderMenu folder={folder} onDelete={onDelete || (() => {})} />
      </div>
    </div>
  );
}

