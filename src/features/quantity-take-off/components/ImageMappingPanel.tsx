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
  FileText,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SymbolList from './SymbolList';
import { useInferenceResults } from '../hooks/useInferenceResults';

// Legacy types for backward compatibility
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
  folderId: string;
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

// Helper function to get proxied image URL
function getProxiedImageUrl(imageUrl: string): string {
  // Use the proxy API to fetch authenticated S3 images
  return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
}

// Annotated image viewer component
function AnnotatedImageViewer({ 
  imageUrl, 
  title,
  isFullscreen,
  onToggleFullscreen,
  isImageLoading,
  onImageLoad
}: { 
  imageUrl: string;
  title?: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isImageLoading: boolean;
  onImageLoad: () => void;
}) {
  const proxiedUrl = getProxiedImageUrl(imageUrl);
  
  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${
      isFullscreen ? 'h-[500px]' : 'h-[300px]'
    }`}>
      {/* Loading overlay */}
      {isImageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#009689]" />
            <span className="text-sm">Loading image...</span>
          </div>
        </div>
      )}
      
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={20}
        wheel={{ step: 0.2 }}
        doubleClick={{ mode: 'toggle' }}
        pinch={{ step: 5 }}
      >
        <ZoomControls />
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proxiedUrl}
              alt={title || 'Annotated blueprint image'}
              className="max-w-full max-h-full object-contain"
              draggable={false}
              onLoad={onImageLoad}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
      
      {/* Fullscreen toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleFullscreen}
        className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white z-10"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// Navigation component
function DrawingNavigation({
  currentIndex,
  totalDrawings,
  onPrevious,
  onNext,
  onDotClick,
  isNavigating,
}: {
  currentIndex: number;
  totalDrawings: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
  isNavigating: boolean;
}) {
  const maxDots = 10;
  const showDots = totalDrawings <= maxDots;
  
  return (
    <div className="flex items-center justify-center gap-4 mt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={currentIndex === 0 || isNavigating}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      
      {showDots ? (
        <div className="flex items-center gap-2">
          {Array.from({ length: totalDrawings }).map((_, index) => (
            <button
              key={index}
              onClick={() => onDotClick(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                index === currentIndex
                  ? 'bg-[#0D0D0D] scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to drawing ${index + 1}`}
            />
          ))}
        </div>
      ) : (
        <span className="text-sm text-gray-600 min-w-[80px] text-center">
          {currentIndex + 1} of {totalDrawings}
        </span>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={currentIndex === totalDrawings - 1 || isNavigating}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Main ImageMappingPanel component
export default function ImageMappingPanel({
  folderId,
  isCollapsible = true,
  defaultCollapsed = false,
}: ImageMappingPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const {
    inferenceData,
    currentDrawing,
    currentIndex,
    totalDrawings,
    symbolColors,
    isLoading,
    error,
    setCurrentIndex,
    goToNext,
    goToPrevious,
  } = useInferenceResults(folderId);

  const handlePrevious = useCallback(() => {
    setIsImageLoading(true);
    goToPrevious();
  }, [goToPrevious]);

  const handleNext = useCallback(() => {
    setIsImageLoading(true);
    goToNext();
  }, [goToNext]);

  const handleDotClick = useCallback((index: number) => {
    setIsImageLoading(true);
    setCurrentIndex(index);
  }, [setCurrentIndex]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 w-full min-w-0">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0D0D0D]" />
            <span className="font-medium text-gray-900">Blueprint Images</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading inference results...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error or no data state
  if (error || !inferenceData || totalDrawings === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 w-full min-w-0">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0D0D0D]" />
            <span className="font-medium text-gray-900">Blueprint Images</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <AlertCircle className="h-8 w-8" />
            <span>{error || 'No inference results available for this folder'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 w-full min-w-0"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#0D0D0D]" />
          <span className="font-medium text-gray-900">
            Blueprint Images
          </span>
          <span className="text-sm text-gray-500">
            ({totalDrawings} {totalDrawings === 1 ? 'image' : 'images'} • {inferenceData.total_symbols} symbols)
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

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 w-full min-w-0">
          {/* Drawing counter */}
          <div className="text-center text-sm text-gray-500 mb-3">
            Image {currentIndex + 1} of {totalDrawings}
            {currentDrawing?.pdf_name && (
              <span className="ml-2 text-gray-700 font-medium">
                - {currentDrawing.pdf_name}
              </span>
            )}
          </div>

          {/* Main content */}
          <div className={`grid gap-4 w-full min-w-0 ${
            isFullscreen 
              ? 'grid-cols-1' 
              : 'grid-cols-1 lg:grid-cols-3'
          }`}>
            {/* Image viewer */}
            <div className={isFullscreen ? '' : 'lg:col-span-2'}>
              {currentDrawing && (
                <AnnotatedImageViewer
                  imageUrl={currentDrawing.image_url}
                  title={currentDrawing.pdf_name}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                  isImageLoading={isImageLoading}
                  onImageLoad={handleImageLoad}
                />
              )}
            </div>

            {/* Symbol list */}
            {!isFullscreen && currentDrawing && (
              <div className="lg:col-span-1">
                <SymbolList
                  symbolCounts={currentDrawing.symbol_counts || {}}
                  symbolColors={symbolColors}
                  activeSymbol={null}
                  onSymbolClick={() => {}} // No filtering needed for annotated images
                  totalSymbols={currentDrawing.total_symbols}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          {totalDrawings > 1 && (
            <DrawingNavigation
              currentIndex={currentIndex}
              totalDrawings={totalDrawings}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onDotClick={handleDotClick}
              isNavigating={isImageLoading}
            />
          )}

          {/* Symbol list below in fullscreen */}
          {isFullscreen && currentDrawing && (
            <div className="mt-4">
              <SymbolList
                symbolCounts={currentDrawing.symbol_counts || {}}
                symbolColors={symbolColors}
                activeSymbol={null}
                onSymbolClick={() => {}}
                totalSymbols={currentDrawing.total_symbols}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
