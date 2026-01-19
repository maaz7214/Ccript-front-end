'use client';

import { useState, useCallback } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from 'react-zoom-pan-pinch';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types for image mapping data
export interface ImageTableRow {
  id: string;
  item: string;
  quantity: string;
}

export interface ImageMapping {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title?: string;
  tableData: ImageTableRow[];
}

interface ImageMappingPanelProps {
  images: ImageMapping[];
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

// Zoom controls component (must be inside TransformWrapper)
function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-1 z-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => zoomOut()}
        className="h-8 w-8 p-0"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => resetTransform()}
        className="h-8 w-8 p-0"
        title="Reset Zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => zoomIn()}
        className="h-8 w-8 p-0"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Image viewer component
function ImageViewer({ 
  imageUrl, 
  title,
  isFullscreen,
  onToggleFullscreen 
}: { 
  imageUrl: string;
  title?: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${
      isFullscreen ? 'h-[500px]' : 'h-[300px]'
    }`}>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        wheel={{ step: 0.1 }}
        doubleClick={{ mode: 'toggle' }}
      >
        <ZoomControls />
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title || 'Blueprint image'}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
      
      {/* Fullscreen toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleFullscreen}
        className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
      
      {/* Image title */}
      {title && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-sm font-medium text-gray-700">
          {title}
        </div>
      )}
    </div>
  );
}

// Navigation dots component
function ImageNavigation({
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
  onDotClick,
}: {
  currentIndex: number;
  totalImages: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      
      {/* Dot indicators */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalImages }).map((_, index) => (
          <button
            key={index}
            onClick={() => onDotClick(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
              index === currentIndex
                ? 'bg-[#009689] scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={currentIndex === totalImages - 1}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Data table component
function ImageDataTable({ data }: { data: ImageTableRow[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <h3 className="text-sm font-semibold text-gray-700">Image Details</h3>
      </div>
      <div className="overflow-auto max-h-[250px]">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Item
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-4 text-center text-gray-500 text-sm">
                  No data for this image
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{row.item}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main ImageMappingPanel component
export default function ImageMappingPanel({
  images,
  isCollapsible = true,
  defaultCollapsed = false,
}: ImageMappingPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentImage = images[currentIndex];

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
  }, [images.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    },
    [handlePrevious, handleNext]
  );

  // Don't render if no images
  if (images.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header - always visible */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[#009689]" />
          <span className="font-medium text-gray-900">
            Blueprint Images
          </span>
          <span className="text-sm text-gray-500">
            ({images.length} {images.length === 1 ? 'image' : 'images'})
          </span>
        </div>
        
        {isCollapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1"
          >
            {isCollapsed ? (
              <>
                <span className="text-sm">Show</span>
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="text-sm">Hide</span>
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content - collapsible */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Image counter */}
          <div className="text-center text-sm text-gray-500 mb-3">
            Image {currentIndex + 1} of {images.length}
            {currentImage?.title && (
              <span className="ml-2 text-gray-700 font-medium">
                - {currentImage.title}
              </span>
            )}
          </div>

          {/* Main content - side by side on desktop, stacked on mobile */}
          <div className={`grid gap-4 ${
            isFullscreen 
              ? 'grid-cols-1' 
              : 'grid-cols-1 lg:grid-cols-3'
          }`}>
            {/* Image viewer - takes 2/3 on desktop */}
            <div className={isFullscreen ? '' : 'lg:col-span-2'}>
              <ImageViewer
                imageUrl={currentImage?.imageUrl || ''}
                title={currentImage?.title}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              />
            </div>

            {/* Data table - takes 1/3 on desktop, hidden in fullscreen */}
            {!isFullscreen && (
              <div className="lg:col-span-1">
                <ImageDataTable data={currentImage?.tableData || []} />
              </div>
            )}
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <ImageNavigation
              currentIndex={currentIndex}
              totalImages={images.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onDotClick={handleDotClick}
            />
          )}

          {/* Table shown below in fullscreen mode */}
          {isFullscreen && (
            <div className="mt-4">
              <ImageDataTable data={currentImage?.tableData || []} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
