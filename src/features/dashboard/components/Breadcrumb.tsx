'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbProps {
  currentPath?: string;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

export default function Breadcrumb({ 
  currentPath = 'Home',
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false
}: BreadcrumbProps) {
  const handleBack = () => {
    if (onBack && canGoBack) {
      onBack();
    }
  };

  const handleForward = () => {
    if (onForward && canGoForward) {
      onForward();
    }
  };

  return (
    <div className="flex items-center space-x-3 py-3 bg-white">
      {/* Navigation Arrows */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={!canGoBack}
          className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForward}
          disabled={!canGoForward}
          className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Path */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700">
          {currentPath}
        </span>
      </div>
    </div>
  );
}