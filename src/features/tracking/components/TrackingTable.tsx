'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadTracking } from '@/services/dashboardService';
import type { TrackingResponse } from '@/types/dashboard';

interface TrackingTableProps {
  initialData: TrackingResponse;
  initialSearch?: string;
}

export default function TrackingTable({ initialData, initialSearch = '' }: TrackingTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [data, setData] = useState<TrackingResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Load data from API
  const loadData = async (search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadTracking(search);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  // Check scroll position and update button states
  const updateScrollButtons = () => {
    if (tableScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Update scroll buttons when data changes
  useEffect(() => {
    if (!loading && data.headers.length > 0) {
      setTimeout(updateScrollButtons, 100);
    }
  }, [loading, data]);

  // Sync initialData when server component re-renders with new data
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setInitialLoading(false);
    }
  }, [initialData]);

  // Sync search query from URL params (when server re-renders)
  useEffect(() => {
    if (initialSearch !== searchQuery) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Update URL with search param
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    // Use router to update URL - this will trigger a server-side re-render
    router.push(`/tracking?${params.toString()}`, { scroll: false });
  };

  const handleRefresh = () => {
    loadData(searchQuery);
  };

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableScrollRef.current) {
      const scrollAmount = 300;
      const currentScroll = tableScrollRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      tableScrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
      
      setTimeout(updateScrollButtons, 300);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-full">
        <h1 className="text-2xl font-bold text-gray-900">
          Project Invites Tracker
        </h1>
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search CSV..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 w-80"
            />
          </div>

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="default"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading state */}
      {(loading || initialLoading) ? (
        <div className="text-center py-20 text-gray-500">
          <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
          <p className="text-lg">Loading tracking data...</p>
        </div>
      ) : data.headers.length === 0 ? (
        // Empty state
        <div className="bg-white rounded-lg border border-gray-200 p-20">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4 opacity-50">📄</div>
            <p className="text-lg mb-2">No data found</p>
            <p className="text-sm text-gray-400">
              Ensure the Excel file exists in S3 or check server logs for details.
            </p>
          </div>
        </div>
      ) : (
        // Data table
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full max-w-full">
          {/* Info bar */}
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-sm text-gray-600">
            Showing {data.total} row{data.total !== 1 ? 's' : ''}
            {searchQuery && ` (filtered by "${searchQuery}")`}
          </div>

          {/* Table Container - Prevents horizontal overflow */}
          <div className="w-full max-w-full overflow-hidden">
            {/* Table Scroll Container */}
            <div 
              ref={tableScrollRef}
              className="overflow-x-auto overflow-y-auto max-h-[600px] w-full"
              onScroll={updateScrollButtons}
              style={{ scrollbarWidth: 'thin' }}
            >
              <table className="w-full min-w-max">
                {/* Header */}
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    {data.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-gray-100">
                  {data.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {data.headers.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap"
                        >
                          {row[header]?.toString() || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollTable('left')}
                disabled={!canScrollLeft}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollTable('right')}
                disabled={!canScrollRight}
                className="flex items-center gap-2"
              >
                Forward
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

