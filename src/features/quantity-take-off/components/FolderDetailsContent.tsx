'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FolderDetailsTable from './FolderDetailsTable';
import type { FolderTableRow } from './FolderDetailsTable';
import ImageMappingPanel from './ImageMappingPanel';
import type { ImageMapping } from './ImageMappingPanel';
import { loadFolderCsvDataAction } from '../../../app/(main)/_actions/folders';
import * as XLSX from 'xlsx';

// Sample data for testing - replace with actual API data
const SAMPLE_IMAGE_DATA: ImageMapping[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=800&fit=crop',
    title: 'Floor Plan - Level 1',
    tableData: [
      { id: '1', item: 'Conduit 3/4"', quantity: '250 ft' },
      { id: '2', item: 'Junction Box 4x4', quantity: '15 units' },
      { id: '3', item: 'Wire #12 AWG', quantity: '500 ft' },
      { id: '4', item: 'Outlets 120V', quantity: '24 units' },
      { id: '5', item: 'Light Fixtures', quantity: '12 units' },
    ],
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=1200&h=800&fit=crop',
    title: 'Electrical Panel Layout',
    tableData: [
      { id: '1', item: 'Panel Box 200A', quantity: '1 unit' },
      { id: '2', item: 'Circuit Breaker 20A', quantity: '24 units' },
      { id: '3', item: 'Ground Bar', quantity: '2 units' },
      { id: '4', item: 'Neutral Bar', quantity: '2 units' },
    ],
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop',
    title: 'Exterior Connections',
    tableData: [
      { id: '1', item: 'Weatherproof Box', quantity: '8 units' },
      { id: '2', item: 'PVC Conduit 1"', quantity: '150 ft' },
      { id: '3', item: 'Exterior Lights', quantity: '6 units' },
    ],
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&h=800&fit=crop',
    title: 'HVAC Electrical Diagram',
    tableData: [
      { id: '1', item: 'Disconnect Switch 60A', quantity: '2 units' },
      { id: '2', item: 'Wire #6 AWG', quantity: '100 ft' },
      { id: '3', item: 'Conduit 1-1/4"', quantity: '50 ft' },
      { id: '4', item: 'Thermostat Wire', quantity: '200 ft' },
    ],
  },
];

interface FolderDetailsContentProps {
  folderId: string;
  userName: string;
}

export default function FolderDetailsContent({ 
  folderId, 
  userName 
}: FolderDetailsContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<FolderTableRow[]>([]);

  // Get folder name from localStorage or use fallback
  const getFolderName = (): string => {
    if (typeof window !== 'undefined') {
      const storedFolders = localStorage.getItem('qtoFolders');
      if (storedFolders) {
        const foldersMap = JSON.parse(storedFolders);
        if (foldersMap[folderId]) {
          return foldersMap[folderId].name;
        }
      }
    }
    // Fallback: try to extract from folderId or use default
    return folderId.replace(/^folder-/, '').replace(/-\w+$/, '') || 'Folder';
  };

  const folderName = getFolderName();

  const [tableData, setTableData] = useState<FolderTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch CSV data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching folder CSV data for folderId:', folderId);
        const data = await loadFolderCsvDataAction(folderId);
        setTableData(data);
      } catch (err) {
        console.error('Error fetching folder CSV data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load folder data');
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (folderId) {
      fetchData();
    }
  }, [folderId]);

  // Initialize edited data when entering edit mode
  useEffect(() => {
    if (isEditMode && editedData.length === 0) {
      setEditedData([...tableData]);
    }
  }, [isEditMode, tableData, editedData.length]);

  const filteredData = (isEditMode ? editedData : tableData).filter(row =>
    row.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.takeoff_date.includes(searchQuery) ||
    row.trade_price.includes(searchQuery)
  );

  const handleBack = () => {
    router.push('/quantity-take-off');
  };
  console.log(editedData);
  const handleEdit = () => {
    if (isEditMode) {
      // Save changes
      setTableData([...editedData]);
      setIsEditMode(false);
      setEditedData([]);
    } else {
      // Enter edit mode
      setIsEditMode(true);
      setEditedData([...tableData]);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedData([]);
  };

  const handleCellChange = (rowId: string, field: keyof FolderTableRow, value: string) => {
    setEditedData(prev => 
      prev.map(row => 
        row.id.toString() === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDownload = () => {
    try {
      // Filter data based on search query if there is one
      const dataToExport = searchQuery 
        ? filteredData 
        : (isEditMode ? editedData : tableData);

      // Prepare data for Excel export with all table columns
      const exportData = dataToExport.map((row, index) => ({
        'S.No': index + 1,
        'ID': row.id,
        'Description': row.description,
        'Date': row.takeoff_date,
        'Trade Price': row.trade_price,
        'Unit': row.unit,
        'Disc %': row.discount_percent || '',
        'Link Price': row.link_price || '',
        'Cost Adj %': row.cost_adjust_percent || '',
        'Net Cost': row.net_cost || '',
        'DB Labor': row.db_labor || '',
        'Labor': row.labor || '',
        'Unit 2': row.labor_unit || '',
        'Lab Adj %': row.labor_adjust_percent || '',
        'Total Material': row.total_material || '',
        'Total Hours': row.total_hours || ''
      }));

      // Create a new workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better formatting
      const columnWidths = [
        { wch: 8 },   // S.No
        { wch: 12 },  // ID
        { wch: 30 },  // Description
        { wch: 12 },  // Date
        { wch: 12 },  // Trade Price
        { wch: 8 },   // Unit
        { wch: 10 },  // Disc %
        { wch: 12 },  // Link Price
        { wch: 12 },  // Cost Adj %
        { wch: 12 },  // Net Cost
        { wch: 12 },  // DB Labor
        { wch: 10 },  // Labor
        { wch: 8 },   // Unit 2
        { wch: 12 },  // Lab Adj %
        { wch: 15 },  // Total Material
        { wch: 12 }   // Total Hours
      ];
      worksheet['!cols'] = columnWidths;

      // Style the header row
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "009689" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Quantity Take-Off');

      // Generate filename with current date and folder name
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `${folderName}_QuantityTakeOff_${currentDate}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);

      console.log(`Excel file downloaded: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      // You could add a toast notification here to inform the user of the error
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0 overflow-x-hidden">
      {/* Welcome Header */}
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome {userName}
      </h1>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4 min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 min-w-0">
          <button 
            onClick={handleBack}
            className="hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            All Folders
          </button>
          <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
          <span className="text-gray-900 font-medium truncate">{folderName}</span>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-shrink-0">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search File"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Download Button */}
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export to Excel</span>
            </Button>

            {/* Edit/Save Button */}
            {isEditMode ? (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-300 whitespace-nowrap"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEdit}
                  className="bg-[#009689] hover:bg-[#007f75] text-white whitespace-nowrap"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                className="bg-[#009689] hover:bg-[#007f75] text-white whitespace-nowrap"
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Image Mapping Panel */}
      <div className="w-full min-w-0">
        <ImageMappingPanel 
          images={SAMPLE_IMAGE_DATA} 
          isCollapsible={true}
          defaultCollapsed={false}
        />
      </div>

      {/* Table */}
      <div className="w-full min-w-0 overflow-x-hidden">
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Loading folder data...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : (
          <FolderDetailsTable 
            data={filteredData} 
            isEditMode={isEditMode}
            onCellChange={handleCellChange}
          />
        )}
      </div>
    </div>
  );
}

