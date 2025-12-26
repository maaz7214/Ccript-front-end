'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface FolderTableRow {
  id: string;
  description: string;
  date: string;
  tradePrice: string;
  unit: string;
  discPercent: string;
  linkPrice: string;
  costAdjPercent: string;
  netCost: string;
  dbLabor: string;
  labor: string;
  unit2: string;
  labAdjPercent: string;
  totalMaterial: string;
  totalHours: string;
}

interface FolderDetailsTableProps {
  data: FolderTableRow[];
  isEditMode?: boolean;
  onCellChange?: (rowId: string, field: keyof FolderTableRow, value: string) => void;
}

export default function FolderDetailsTable({ data, isEditMode = false, onCellChange }: FolderDetailsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

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
  }, [data, paginatedData]);

  // Also check on initial mount
  useEffect(() => {
    updateScrollButtons();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Render editable cell
  const renderEditableCell = (
    value: string,
    rowId: string,
    field: keyof FolderTableRow,
    className: string = ''
  ) => {
    if (isEditMode && onCellChange) {
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onCellChange(rowId, field, e.target.value)}
          className={`h-7 px-2 text-xs border-gray-300 focus:border-[#009689] focus:ring-[#009689] w-full ${className}`}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    return <span className={`${className} block truncate`} title={value}>{value || ''}</span>;
  };

  const columns = [
    { key: 'description', label: 'Description', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'tradePrice', label: 'Trade Price', sortable: true },
    { key: 'unit', label: 'Unit', sortable: true },
    { key: 'discPercent', label: 'Disc %', sortable: true },
    { key: 'linkPrice', label: 'Link Price', sortable: true },
    { key: 'costAdjPercent', label: 'Cost Adj %', sortable: true },
    { key: 'netCost', label: 'Net Cost', sortable: true },
    { key: 'dbLabor', label: 'DB Labor', sortable: true },
    { key: 'labor', label: 'Labor', sortable: true },
    { key: 'unit2', label: 'Unit', sortable: true },
    { key: 'labAdjPercent', label: 'Lab Adj %', sortable: true },
    { key: 'totalMaterial', label: 'Total Material', sortable: true },
    { key: 'totalHours', label: 'Total Hours', sortable: true },
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Container - Prevents horizontal overflow */}
      <div className="w-full overflow-hidden">
        {/* Table Scroll Container */}
        <div 
          ref={tableScrollRef}
          className="overflow-x-auto overflow-y-auto max-h-[600px] w-full"
          onScroll={updateScrollButtons}
          style={{ scrollbarWidth: 'thin' }}
        >
          <table className="w-full table-fixed" style={{ minWidth: 'max(1200px, 100vw - 200px)' }}>
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="w-12 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  #
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-64 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Description
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Date
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Trade Price
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Unit
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Disc %
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Link Price
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Cost Adj %
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Net Cost
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  DB Labor
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Labor
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Unit
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Lab Adj %
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-1">
                  Total Material
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                <div className="flex items-center gap-1">
                  Total Hours
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={row.id} className={`hover:bg-gray-50 ${isEditMode ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-3 py-3 text-sm text-gray-500 border-r border-gray-200">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="truncate max-w-xs" title={row.description}>
                      {renderEditableCell(row.description, row.id, 'description', 'text-sm text-gray-900')}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.date, row.id, 'date', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.tradePrice, row.id, 'tradePrice', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.unit, row.id, 'unit', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.discPercent || '', row.id, 'discPercent', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.linkPrice, row.id, 'linkPrice', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.costAdjPercent, row.id, 'costAdjPercent', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.netCost, row.id, 'netCost', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.dbLabor, row.id, 'dbLabor', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.labor, row.id, 'labor', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.unit2, row.id, 'unit2', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.labAdjPercent, row.id, 'labAdjPercent', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                    {renderEditableCell(row.totalMaterial, row.id, 'totalMaterial', 'text-sm text-gray-900')}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {renderEditableCell(row.totalHours, row.id, 'totalHours', 'text-sm text-gray-900')}
                  </td>
                </tr>
              ))
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
                      ? 'bg-[#009689] hover:bg-[#007f75] text-white'
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

