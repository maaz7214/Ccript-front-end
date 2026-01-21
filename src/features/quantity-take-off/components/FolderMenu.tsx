'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FolderCardData } from './FolderCard';

interface FolderMenuProps {
  folder: FolderCardData;
  onDelete: (folder: FolderCardData) => void;
}

export default function FolderMenu({ folder, onDelete }: FolderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onDelete(folder);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <MoreVertical className="h-4 w-4 text-gray-600" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-md cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete Folder
          </button>
        </div>
      )}
    </div>
  );
}
