'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// API Response type - matches the API structure exactly
export interface FolderTableRow {
  id: number;
  item_no: string;
  description: string;
  date: string;
  quantity: number | null;
  trade_price: number | null;
  discount_percent: number | null;
  net_cost: number | null;
  unit: string;
  db_labor: number | null;
  labor: number | null;
  labor_unit: string;
  labor_adjust_percent: number | null;
  total_material: number | null;
  total_hours: number | null;
  is_parent: boolean;
  parent_id: number | null;
  quantity_per_unit: number | null;
}

interface FolderDetailsTableProps {
  data: FolderTableRow[];
  isEditMode?: boolean;
  onCellChange?: (rowId: string, field: keyof FolderTableRow, value: string) => void;
  currentPage?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export default function FolderDetailsTable({ 
  data, 
  isEditMode = false, 
  onCellChange,
  currentPage: externalCurrentPage,
  totalCount,
  pageSize = 50,
  onPageChange,
  isLoading = false
}: FolderDetailsTableProps) {
  // Use external pagination if provided, otherwise use internal state (for edit mode)
  const [internalPage, setInternalPage] = useState(1);
  const currentPage = externalCurrentPage ?? internalPage;
  const isServerSidePagination = externalCurrentPage !== undefined && onPageChange !== undefined;
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  
  // For server-side pagination, use data directly; for client-side (edit mode), use all data
  const displayData = isServerSidePagination ? data : data;
  
  // Calculate total pages
  const totalPages = isServerSidePagination && totalCount !== undefined
    ? Math.ceil(totalCount / pageSize)
    : Math.ceil(data.length / 10); // Fallback to 10 items per page for client-side

  // Check scroll position and update button states
  const updateScrollButtons = () => {
    if (tableScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Update scroll buttons when data changes or component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollButtons();
    }, 100);
    return () => clearTimeout(timer);
  }, [data, displayData]);

  // Also check on initial mount
  useEffect(() => {
    updateScrollButtons();
  }, []);

  const handlePageChange = (page: number) => {
    if (isServerSidePagination && onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
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

  // Helper function to format price values
  const formatPrice = (value: string | number | null | undefined): string => {
    if (value == null || value === '') return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return String(value);
    return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Check if a field is a price field
  const isPriceField = (field: keyof FolderTableRow): boolean => {
    return field === 'trade_price' || field === 'net_cost' || field === 'total_material';
  };

  // Render editable cell - handles both string and number values
  const renderEditableCell = (
    value: string | number | null | undefined,
    rowId: string,
    field: keyof FolderTableRow,
    className: string = ''
  ) => {
    // Check if value is empty (null, undefined, or empty string)
    // Note: 0 is a valid value and should be displayed
    const isEmpty = value == null || value === '';
    
    // Convert to string, but show empty if null/undefined/empty string
    const stringValue = isEmpty ? '' : String(value);
    
    if (isEditMode && onCellChange) {
      return (
        <Input
          type="text"
          value={stringValue}
          onChange={(e) => onCellChange(rowId, field, e.target.value)}
          className={`h-7 px-2 text-xs border-gray-300 focus:border-[#0D0D0D] focus:ring-[#0D0D0D] w-full ${className}`}
          onClick={(e) => e.stopPropagation()}
          placeholder=""
        />
      );
    }
    
    // Format price fields with dollar sign when displaying (not editing)
    const displayValue = isPriceField(field) && !isEmpty ? formatPrice(value) : stringValue;
    
    return <span className={`${className} block truncate`} title={displayValue}>{displayValue}</span>;
  };

  const columns = [
    { key: 'item_no', label: 'Item No', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    { key: 'unit', label: 'Unit', sortable: true },
    { key: 'trade_price', label: 'Trade Price', sortable: true },
    { key: 'discount_percent', label: 'Discount %', sortable: true },
    { key: 'net_cost', label: 'Net Cost', sortable: true },
    { key: 'db_labor', label: 'DB Labor', sortable: true },
    { key: 'labor', label: 'Labor', sortable: true },
    { key: 'labor_unit', label: 'Labor Unit', sortable: true },
    { key: 'labor_adjust_percent', label: 'Labor Adj %', sortable: true },
    { key: 'total_material', label: 'Total Material', sortable: true },
    { key: 'total_hours', label: 'Total Hours', sortable: true },
  ];

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full min-w-0 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin text-[#009689]" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Table Container - Prevents horizontal overflow */}
      <div className="w-full min-w-0 overflow-hidden">
        {/* Table Scroll Container */}
        <div 
          ref={tableScrollRef}
          className="overflow-x-auto overflow-y-auto max-h-[600px] w-full"
          onScroll={updateScrollButtons}
          style={{ scrollbarWidth: 'thin' }}
        >
          <table className="w-full table-fixed" style={{ minWidth: '1200px' }}>
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="w-12 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      #
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Row number</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Item No
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Item number or identifier for the line item</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-64 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Description
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Description of the material or item</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Date
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Date of the takeoff or entry</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Quantity
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quantity of items needed</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Unit
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unit of measurement for the material (E=Each, C=Count, M=Meters, etc.)</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Trade Price
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Trade price per unit before discounts</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Discount %
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Discount percentage applied to trade price</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Net Cost
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Net cost per unit after discount</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      DB Labor
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Database labor hours per unit</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Labor
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Labor hours per unit</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Labor Unit
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unit of measurement for labor (E=Each, C=Count, M=Meters, etc.)</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Labor Adj %
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Labor adjustment percentage</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Total Material
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total material cost (quantity × net cost)</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      Total Hours
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total labor hours (quantity × labor hours per unit)</p>
                  </TooltipContent>
                </Tooltip>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              displayData.map((row, index) => {
                const rowId = row.id.toString();
                // Calculate row number based on pagination type
                const rowNumber = isServerSidePagination 
                  ? ((currentPage - 1) * pageSize) + index + 1
                  : index + 1;
                return (
                  <tr key={rowId} className={`hover:bg-gray-50 ${isEditMode ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-3 py-3 text-sm text-gray-500 border-r border-gray-200">
                      {renderEditableCell(rowId, rowNumber.toString(), 'id', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.item_no ?? '', rowId, 'item_no', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200">
                      <div className="truncate max-w-xs" title={String(row.description)}>
                        {renderEditableCell(row.description || '', rowId, 'description', 'text-sm text-gray-900')}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.date ?? '', rowId, 'date', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.quantity != null ? row.quantity : '', rowId, 'quantity', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.unit || '', rowId, 'unit', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.trade_price != null ? row.trade_price : '', rowId, 'trade_price', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.discount_percent != null ? row.discount_percent : '', rowId, 'discount_percent', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.net_cost != null ? row.net_cost : '', rowId, 'net_cost', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.db_labor != null ? row.db_labor : '', rowId, 'db_labor', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.labor != null ? row.labor : '', rowId, 'labor', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.labor_unit || '', rowId, 'labor_unit', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.labor_adjust_percent != null ? row.labor_adjust_percent : '', rowId, 'labor_adjust_percent', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                      {renderEditableCell(row.total_material != null ? row.total_material : '', rowId, 'total_material', 'text-sm text-gray-900')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {renderEditableCell(row.total_hours != null ? row.total_hours : '', rowId, 'total_hours', 'text-sm text-gray-900')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Scroll Navigation Buttons */}
        <div className="flex items-center justify-center gap-4 py-3 border-t border-gray-200 bg-gray-50">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 text-gray-400">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page
                      ? 'bg-[#0D0D0D] hover:bg-[#1a1a1a] text-white'
                      : ''
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

