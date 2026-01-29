'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InferenceResultsResponse, InferenceDrawing } from '@/app/(main)/_actions/folders';

// Color palette for symbols
const colorPalette = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#fd79a8', '#00b894', '#6c5ce7', '#fdcb6e', '#e17055',
  '#00cec9', '#a29bfe', '#fab1a0', '#74b9ff', '#ff7675',
  '#55efc4', '#81ecec', '#b2bec3', '#dfe6e9', '#636e72',
];

export function generateSymbolColors(symbolCounts: Record<string, number>): Record<string, string> {
  const colors: Record<string, string> = {};
  const symbols = Object.keys(symbolCounts);
  
  symbols.forEach((symbol, index) => {
    colors[symbol] = colorPalette[index % colorPalette.length];
  });
  
  return colors;
}

export interface UseInferenceResultsReturn {
  // Data
  inferenceData: InferenceResultsResponse | null;
  drawings: InferenceDrawing[];
  currentDrawing: InferenceDrawing | null;
  currentIndex: number;
  totalDrawings: number;
  symbolColors: Record<string, string>;
  
  // State
  isLoading: boolean;
  error: string | null;
  status: string | null;
  
  // Actions
  setCurrentIndex: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  refetch: () => Promise<void>;
}

export function useInferenceResults(folderId: string): UseInferenceResultsReturn {
  const [inferenceData, setInferenceData] = useState<InferenceResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [symbolColors, setSymbolColors] = useState<Record<string, string>>({});

  // Fetch inference results
  const fetchData = useCallback(async () => {
    if (!folderId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useInferenceResults] Fetching for folderId:', folderId);
      
      const response = await fetch(`/api/inference-results/${folderId}`, {
        cache: 'no-store',
      });

      console.log('[useInferenceResults] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: InferenceResultsResponse = await response.json();
      console.log('[useInferenceResults] Data received, drawings:', data.drawings?.length || 0);
      
      if (data.status !== 'completed') {
        setInferenceData(null);
        setError(`Inference job is ${data.status}`);
      } else {
        setInferenceData(data);
        setCurrentIndex(0);
        
        // Generate colors for all symbols
        if (data.symbol_counts) {
          const colors = generateSymbolColors(data.symbol_counts);
          setSymbolColors(colors);
        }
      }
    } catch (err) {
      console.error('Error fetching inference results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inference results');
      setInferenceData(null);
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  // Fetch on mount and when folderId changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived state
  const drawings = inferenceData?.drawings || [];
  const totalDrawings = drawings.length;
  const currentDrawing = drawings[currentIndex] || null;

  // Navigation actions
  const goToNext = useCallback(() => {
    if (currentIndex < totalDrawings - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalDrawings]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  return {
    // Data
    inferenceData,
    drawings,
    currentDrawing,
    currentIndex,
    totalDrawings,
    symbolColors,
    
    // State
    isLoading,
    error,
    status: inferenceData?.status || null,
    
    // Actions
    setCurrentIndex,
    goToNext,
    goToPrevious,
    refetch: fetchData,
  };
}
