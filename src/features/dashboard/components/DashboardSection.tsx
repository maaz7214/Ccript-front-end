'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload } from 'lucide-react';
import Breadcrumb from './Breadcrumb';

export default function DashboardSection() {
  // Navigation state
  const [navigationHistory, setNavigationHistory] = useState(['Home']);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample folder names for demo
  const sampleFolders = ['Project Alpha', 'Project Beta', 'Documents', 'Media Files', 'Reports'];

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    console.log('Refresh clicked');
  };

  const handleTracking = () => {
    // TODO: Implement tracking functionality
    console.log('Tracking clicked');
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
      <div className="flex justify-between items-center">
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

        {/* Tracking Button */}
        <Button
          onClick={handleTracking}
          variant="default"
          size="default"
          className="flex cursor-pointer items-center gap-2 bg-[#009689] hover:bg-[#007f75]"
        >
          Tracking
        </Button>
      </div>

     

      {/* Upload UI Section */}
      <div className="w-full">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
          <div className="space-y-4">
            {/* Upload Text with Icon */}
            <div className="flex items-center py-6 justify-center gap-3">
              <Upload className="h-6 w-6 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Upload Folder
              </h3>
            </div>
          </div>
        </div>
         {/* Breadcrumb Navigation */}
      </div>
      <div className="border-b border-gray-200 pb-2">
        <Breadcrumb 
          currentPath={getCurrentPath()}
          onBack={handleBack}
          onForward={handleForward}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
        />
      </div>
    </div>
  );
}