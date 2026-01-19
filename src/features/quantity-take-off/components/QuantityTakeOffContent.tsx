'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import DragDropFolder from './DragDropFolder';
import FolderGrid from './FolderGrid';
import type { FolderCardData } from './FolderCard';
import { useJobs } from '@/contexts/JobsContext';
import { uploadFolderAction, loadFoldersAction } from '@/app/actions/folders';

interface QuantityTakeOffContentProps {
  initialFolders: FolderCardData[];
  userName: string;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)}${sizes[i]}`;
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to calculate total size of files
function calculateTotalSize(files: FileList): number {
  let totalSize = 0;
  for (let i = 0; i < files.length; i++) {
    totalSize += files[i].size;
  }
  return totalSize;
}

// Helper function to get folder name from FileList
function getFolderName(files: FileList): string {
  if (files.length === 0) return 'New Folder';
  
  // Try to get the folder name from the first file's path
  const firstFile = files[0];
  const path = (firstFile as any).webkitRelativePath || firstFile.name;
  const parts = path.split('/');
  
  // The first part is usually the folder name
  if (parts.length > 1) {
    return parts[0];
  }
  
  // Fallback: use a timestamp-based name
  return `Folder ${new Date().toLocaleDateString()}`;
}

export default function QuantityTakeOffContent({ initialFolders, userName }: QuantityTakeOffContentProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderCardData[]>(initialFolders);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { addJob, getJobCounts } = useJobs();
  const jobCounts = getJobCounts();

  // Store initial folders in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFolders = localStorage.getItem('qtoFolders');
      const foldersMap = storedFolders ? JSON.parse(storedFolders) : {};
      
      // Add initial folders to the map if they don't exist
      initialFolders.forEach((folder) => {
        if (!foldersMap[folder.id]) {
          foldersMap[folder.id] = {
            name: folder.name,
            date: folder.date,
            size: folder.size,
          };
        }
      });
      
      localStorage.setItem('qtoFolders', JSON.stringify(foldersMap));
    }
  }, [initialFolders]);

  const handleFolderUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get folder name from files
      const folderName = getFolderName(files);
      
      // Create FormData for server action
      const formData = new FormData();
      formData.append('folder_name', folderName);
      
      // Append all files
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      // Upload to API via server action (runs on server, avoids mixed content issue)
      const response = await uploadFolderAction(formData);
      
      // Calculate folder info for display
      const totalSize = calculateTotalSize(files);
      const formattedSize = formatFileSize(totalSize);
      const currentDate = formatDate(new Date());

      // Create new folder entry with API response data
      const newFolder: FolderCardData = {
        id: response.folder_id.toString(),
        name: response.folder_name,
        date: currentDate,
        size: formattedSize,
        isNew: true,
      };

      // Store folder data in localStorage for retrieval on details page
      if (typeof window !== 'undefined') {
        const storedFolders = localStorage.getItem('qtoFolders');
        const foldersMap = storedFolders ? JSON.parse(storedFolders) : {};
        foldersMap[newFolder.id] = {
          name: newFolder.name,
          date: newFolder.date,
          size: newFolder.size,
        };
        localStorage.setItem('qtoFolders', JSON.stringify(foldersMap));
      }

      // Add to the beginning of the list (most recent first)
      setFolders((prev) => [newFolder, ...prev]);

      // Create a job for this upload
      addJob(folderName);

      // Optionally refresh folder list from server to get latest data
      // This ensures we have the most up-to-date folder information
      try {
        const refreshedFolders = await loadFoldersAction();
        setFolders(refreshedFolders);
      } catch (refreshError) {
        console.error('Error refreshing folder list:', refreshError);
        // Don't show error to user, we already added the folder locally
      }

      // Remove "New" badge after 5 seconds
      setTimeout(() => {
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === newFolder.id ? { ...folder, isNew: false } : folder
          )
        );
      }, 5000);
    } catch (error) {
      console.error('Error uploading folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload folder';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [addJob]);

  const handleFolderClick = useCallback((folder: FolderCardData) => {
    // Navigate to folder details page
    router.push(`/quantity-take-off/${folder.id}`);
  }, [router]);

  const handleMenuClick = useCallback((folder: FolderCardData) => {
    console.log('Menu clicked for folder:', folder);
    // Add your menu action logic here
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome {userName}
          </h1>
          
          {/* Jobs Button */}
          <Button
            variant="outline"
            onClick={() => router.push('/jobs')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Jobs
            {jobCounts.all > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-[#009689] text-white text-xs rounded-full">
                {jobCounts.all}
              </span>
            )}
          </Button>
        </div>
        
        <div className="space-y-8">
          <DragDropFolder 
            onFolderUpload={handleFolderUpload}
            isUploading={isUploading}
          />
          
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {uploadError}
            </div>
          )}
          
          <FolderGrid 
            folders={folders}
            onFolderClick={handleFolderClick}
            onMenuClick={handleMenuClick}
          />
        </div>
      </div>
    </div>
  );
}

