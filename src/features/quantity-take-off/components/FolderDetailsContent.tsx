'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FolderDetailsTable from './FolderDetailsTable';
import type { FolderTableRow } from './FolderDetailsTable';

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

  // TODO: Replace with actual data from API
  const [tableData, setTableData] = useState<FolderTableRow[]>([
    {
      id: '1',
      description: 'K1 (EXTERIOR WALL MOUNT IP066 RATED)',
      date: '2/11/2014',
      tradePrice: '75.90',
      unit: 'E',
      discPercent: '',
      linkPrice: '71.00',
      costAdjPercent: '10.00',
      netCost: '83.49',
      dbLabor: '95.00',
      labor: '1.00',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '200.34',
      totalHours: '5.16',
    },
    {
      id: '2',
      description: "A/E MANHOLE (8'x10'x6')",
      date: '9/2/2016',
      tradePrice: '130.18',
      unit: 'C',
      discPercent: '',
      linkPrice: '60.11',
      costAdjPercent: '10.00',
      netCost: '71.99',
      dbLabor: '13.00',
      labor: '96.00',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '13.23',
      totalHours: '122.55',
    },
    {
      id: '3',
      description: 'Chairs',
      date: '9/2/2016',
      tradePrice: '12 MB',
      unit: 'D',
      discPercent: '',
      linkPrice: '60.11',
      costAdjPercent: '10.00',
      netCost: '65.00',
      dbLabor: '27.50',
      labor: '2.00',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '57.89',
      totalHours: '78.34',
    },
    {
      id: '4',
      description: "S3 (STORAGE SHED 10'x12)",
      date: '8/15/2016',
      tradePrice: '250.00',
      unit: 'E',
      discPercent: '',
      linkPrice: '200.00',
      costAdjPercent: '15.00',
      netCost: '230.00',
      dbLabor: '150.00',
      labor: '3.50',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '380.00',
      totalHours: '4.52',
    },
    {
      id: '5',
      description: 'F4 (FIRE PIT)',
      date: '7/20/2016',
      tradePrice: '180.50',
      unit: 'C',
      discPercent: '',
      linkPrice: '140.00',
      costAdjPercent: '12.00',
      netCost: '156.80',
      dbLabor: '85.00',
      labor: '2.25',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '241.80',
      totalHours: '2.90',
    },
    {
      id: '6',
      description: 'W1 (WATER FOUNTAIN)',
      date: '6/10/2016',
      tradePrice: '320.75',
      unit: 'E',
      discPercent: '',
      linkPrice: '250.00',
      costAdjPercent: '20.00',
      netCost: '300.00',
      dbLabor: '200.00',
      labor: '4.00',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '500.00',
      totalHours: '5.16',
    },
    {
      id: '7',
      description: 'D1 (DECKING MATERIAL)',
      date: '5/5/2016',
      tradePrice: '95.25',
      unit: 'D',
      discPercent: '',
      linkPrice: '75.00',
      costAdjPercent: '8.00',
      netCost: '81.00',
      dbLabor: '50.00',
      labor: '1.50',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '131.00',
      totalHours: '1.94',
    },
    {
      id: '8',
      description: 'P2 (PERGOLA STRUCTURE)',
      date: '4/18/2016',
      tradePrice: '450.00',
      unit: 'E',
      discPercent: '',
      linkPrice: '350.00',
      costAdjPercent: '25.00',
      netCost: '437.50',
      dbLabor: '300.00',
      labor: '6.00',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '737.50',
      totalHours: '7.74',
    },
    {
      id: '9',
      description: 'E1 (ELECTRICAL SUPPLY BOX)',
      date: '3/12/2016',
      tradePrice: '125.50',
      unit: 'C',
      discPercent: '',
      linkPrice: '100.00',
      costAdjPercent: '11.00',
      netCost: '111.00',
      dbLabor: '75.00',
      labor: '1.75',
      unit2: 'E',
      labAdjPercent: '29.00',
      totalMaterial: '186.00',
      totalHours: '2.26',
    },
  ]);

  // Initialize edited data when entering edit mode
  useEffect(() => {
    if (isEditMode && editedData.length === 0) {
      setEditedData([...tableData]);
    }
  }, [isEditMode, tableData, editedData.length]);

  const filteredData = (isEditMode ? editedData : tableData).filter(row =>
    row.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.date.includes(searchQuery) ||
    row.tradePrice.includes(searchQuery)
  );

  const handleBack = () => {
    router.push('/quantity-take-off');
  };

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
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDownload = () => {
    console.log('Download clicked');
    // Add download logic here
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Welcome Header */}
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome {userName}
      </h1>
      <div className="flex items-center justify-between w-full">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600">
          <button 
            onClick={handleBack}
            className="hover:text-gray-900 transition-colors"
          >
            All Folders
          </button>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">{folderName}</span>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search File"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Download Button */}
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* Edit/Save Button */}
          {isEditMode ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-[#009689] hover:bg-[#007f75] text-white"
              >
                Save
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEdit}
              className="bg-[#009689] hover:bg-[#007f75] text-white"
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      {/* Table */}
      <div className="w-full max-w-[1700px]">
        <FolderDetailsTable 
          data={filteredData} 
          isEditMode={isEditMode}
          onCellChange={handleCellChange}
        />
      </div>
    </div>
  );
}

