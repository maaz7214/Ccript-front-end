'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UploadModal from '@/components/UploadModal';
import FolderList from './FolderList';
import { RefreshCw, Search } from 'lucide-react';
import Breadcrumb from './Breadcrumb';

export default function DashboardSection() {
  // Navigation state
  const [navigationHistory, setNavigationHistory] = useState(['Home']);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  // Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sample folder names for demo
  const sampleFolders = ['Project Alpha', 'Project Beta', 'Documents', 'Media Files', 'Reports'];

  // Sample folders data
  const folders = [
    { id: '1', name: 'Project Alpha', type: 'folder' as const },
    { id: '2', name: 'Project Beta', type: 'folder' as const },
    { id: '3', name: 'Documents', type: 'folder' as const },
    { id: '4', name: 'report.pdf', type: 'file' as const },
    { id: '5', name: 'Media Files', type: 'folder' as const },
    { id: '6', name: 'presentation.pptx', type: 'file' as const },
    { id: '7', name: 'Design Assets', type: 'folder' as const },
    { id: '8', name: 'Development', type: 'folder' as const },
    { id: '9', name: 'budget.xlsx', type: 'file' as const },
  ];

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    console.log('Refresh clicked');
  };

  const handleUploadFolder = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFiles(null);
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      // Automatically start upload when folder is selected
      startUpload(files);
    }
  };

  const startUpload = async (files: FileList) => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // TODO: Replace with actual upload logic
      console.log('Uploading folder with', files.length, 'files');
      
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    }
  };

  const handleTryAgain = () => {
    if (selectedFiles) {
      startUpload(selectedFiles);
    }
  };

  const handleCloseSuccess = () => {
    handleCloseModal();
  };

  const handleFolderClick = (item: { id: string; name: string; type: 'folder' | 'file' }) => {
    if (item.type === 'folder') {
      // TODO: Implement folder navigation
      console.log('Folder clicked:', item.name);
    } else {
      // TODO: Implement file opening/downloading
      console.log('File clicked:', item.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      // Automatically start upload when folder is dropped
      startUpload(files);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality
    console.log('Search query:', e.target.value);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleForward = () => {
    if (currentIndex < navigationHistory.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Add a new folder to demonstrate forward navigation
      const randomFolder = sampleFolders[Math.floor(Math.random() * sampleFolders.length)];
      const newHistory = [...navigationHistory.slice(0, currentIndex + 1), randomFolder];
      setNavigationHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
  };

  // Get current path display
  const getCurrentPath = () => {
    return navigationHistory.slice(0, currentIndex + 1).join(' > ');
  };

  const canGoBack = currentIndex > 0;
  const canGoForward = true; // Always allow forward for demo

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center gap-4">
        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          variant="secondary"
          size="default"
          className="flex cursor-pointer bg-white items-center text-[#009689] gap-2 border border-[#009689]"
        >
          <RefreshCw className="h-4 w-4 text-[#009689]" />
          Refresh
        </Button>

        {/* Spacer to push right side elements to the right */}
        <div className="flex-1"></div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by project name, Status"
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 w-80"
          />
        </div>

        {/* Upload Folder Button */}
        <Button
          onClick={handleUploadFolder}
          variant="default"
          size="default"
          className="flex cursor-pointer items-center gap-2 bg-[#009689] hover:bg-[#007f75]"
        >
          Upload Folder
        </Button>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-200 pb-2">
        <Breadcrumb 
          currentPath={getCurrentPath()}
          onBack={handleBack}
          onForward={handleForward}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
        />
      </div>

      {/* Folder List */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Files & Folders</h3>
        <FolderList folders={folders} onFolderClick={handleFolderClick} />
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        selectedFiles={selectedFiles}
        onFolderSelect={handleFolderSelect}
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        onCancel={handleCloseModal}
        onTryAgain={handleTryAgain}
        onClose={handleCloseSuccess}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
}