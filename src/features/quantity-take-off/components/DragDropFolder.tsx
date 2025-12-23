'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface DragDropFolderProps {
  onFolderUpload?: (files: FileList) => void;
}

export default function DragDropFolder({ onFolderUpload }: DragDropFolderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFolderUpload?.(files);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFolderUpload?.(files);
      // Reset the input so the same folder can be selected again
      e.target.value = '';
    }
  };

  return (
    <>
      <div
        className={`
          w-full border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${isDragging 
            ? 'border-[#009689] bg-[#009689]/5' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-16 h-16">
            <Image
              src="/folder.svg"
              alt="Folder icon"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-lg text-gray-600">
            Drag and drop folder here
          </p>
          <Button
            onClick={handleChooseFile}
            className="bg-[#009689] hover:bg-[#007f75] text-white"
          >
            Choose File
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    </>
  );
}

