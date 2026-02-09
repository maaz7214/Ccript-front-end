'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FolderList from './FolderList';
import { RefreshCw, Search, Upload, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DashboardItem, UploadProgress } from '@/types/dashboard';
import {
  loadStructure,
  deleteItem,
  uploadFiles,
  createUploadWebSocket,
  generateClientId,
} from '@/services/dashboardService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';

export default function DashboardSection() {
  // Navigation state
  const [currentPath, setCurrentPath] = useState('');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Data state
  const [displayedItems, setDisplayedItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessages, setUploadMessages] = useState<string[]>([]);
  const [latestMessage, setLatestMessage] = useState<string>('');
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const uploadStatusRef = useRef<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const uploadWebSocketRef = useRef<WebSocket | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DashboardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingItemPath, setDeletingItemPath] = useState<string | null>(null);

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const limit = itemsPerPage === 0 ? 0 : itemsPerPage;
      const data = await loadStructure(currentPage, limit, searchQuery);
      console.log('data', data);
      
      // Filter items based on current path
      const filtered = filterItemsByPath(data.items, currentPath);
      setDisplayedItems(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, currentPath]);

  // Filter items to show only current directory
  const filterItemsByPath = (items: DashboardItem[], path: string): DashboardItem[] => {
    const currentFolders: DashboardItem[] = [];
    const currentFiles: DashboardItem[] = [];

    items.forEach((item) => {
      if (item.item_type === 'folder') {
        const folderPath = item.path;
        
        if (path === '') {
          // Root level: show folders that don't have a slash
          if (!folderPath.includes('/')) {
            currentFolders.push(item);
          }
        } else {
          // Inside a folder: show direct children only
          if (folderPath.startsWith(path + '/')) {
            const relativePath = folderPath.substring(path.length + 1);
            // Only direct children (no more slashes)
            if (!relativePath.includes('/')) {
              currentFolders.push(item);
            }
          }
        }
      } else {
        // File
        const fileFolder = item.folder;
        
        if (path === '' && fileFolder === '/') {
          // Root level files
          currentFiles.push(item);
        } else if (fileFolder === path) {
          // Files in current folder
          currentFiles.push(item);
        }
      }
    });

    return [...currentFolders, ...currentFiles];
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update ref when status changes
  useEffect(() => {
    uploadStatusRef.current = uploadStatus;
    console.log('uploadStatus changed to:', uploadStatus, 'ref updated');
  }, [uploadStatus]);

  // Force progress to 100% when upload status changes to success
  useEffect(() => {
    if (uploadStatus === 'success') {
      console.log('useEffect: Upload status is success, current progress:', uploadProgress);
      if (uploadProgress !== 100) {
        console.log('useEffect: Forcing progress to 100%');
        setUploadProgress(100);
      }
    }
  }, [uploadStatus, uploadProgress]);

  // Navigation functions
  const navigateToFolder = (folderPath: string, skipHistory = false) => {
    setCurrentPath(folderPath);
    
    if (!skipHistory) {
      // Remove any forward history when navigating to a new location
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(folderPath);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    // Reset search and pagination when navigating
    setSearchQuery('');
    setCurrentPage(1);
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(navigationHistory[newIndex]);
      setCurrentPage(1);
    }
  };

  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(navigationHistory[newIndex]);
      setCurrentPage(1);
    }
  };

  const navigateToRoot = () => {
    if (currentPath !== '') {
      navigateToFolder('');
    }
  };

  // Handle item click (navigate to folder or open file)
  const handleItemClick = (item: DashboardItem) => {
    if (item.item_type === 'folder') {
      navigateToFolder(item.path);
    }
    // TODO: Handle file click (download, preview, etc.)
  };

  // Handle delete
  const handleDeleteClick = (item: DashboardItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      setDeletingItemPath(itemToDelete.path);
      await deleteItem(itemToDelete.path, itemToDelete.item_type);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      // Reload data
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsDeleting(false);
      setDeletingItemPath(null);
    }
  };

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };


  // Handle upload
  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
    setUploadStatus('idle');
    setSelectedFiles(null);
    setUploadProgress(0);
    setUploadMessages([]);
    setIsUploadComplete(false);
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      await startUpload(Array.from(files));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Convert FileList to FileList-like object for state
      setSelectedFiles(files);
      await startUpload(Array.from(files));
    }
  };

  const startUpload = async (files: File[]) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadMessages([]);
    setLatestMessage('');
    setIsUploadComplete(false);

    const clientId = generateClientId();

    try {
      // Connect to WebSocket (Promise-based, like in reference)
      const ws = await createUploadWebSocket(
        clientId,
        (data: UploadProgress) => {
          console.log('WebSocket message received:', data.type, data);
          
          if (data.type === 'progress') {
            setUploadMessages((prev) => [...prev, data.message]);
            setLatestMessage(data.message || '');
            
            // Only update progress if we're not already complete and we have a progress value
            // Don't set to 100% based on message content - only use actual progress value
            if (data.progress !== undefined && !isUploadComplete && uploadStatusRef.current !== 'success') {
              // Use the actual progress value from the server, but cap at 99% until we get 'complete' message
              const newProgress = Math.min(data.progress, 99);
              console.log('Progress update:', newProgress, '%', 'isUploadComplete:', isUploadComplete, 'status:', uploadStatusRef.current);
              setUploadProgress(newProgress);
            } else {
              console.log('Skipping progress update - isUploadComplete:', isUploadComplete, 'status:', uploadStatusRef.current);
            }
          } else if (data.type === 'complete') {
            console.log('Upload complete received, setting progress to 100%');
            setUploadMessages((prev) => [...prev, data.message]);
            setLatestMessage(data.message || 'Upload complete');
            setIsUploadComplete(true);
            // Update ref FIRST (synchronous, immediate)
            uploadStatusRef.current = 'success';
            // Then set both states - React will batch them
            setUploadStatus('success');
            setUploadProgress(100);
            console.log('Progress set to 100%, status set to success, ref updated to:', uploadStatusRef.current);
            
            // Force a re-render by updating a dummy state to ensure UI reflects the change
            setTimeout(() => {
              console.log('Verifying state after timeout - status:', uploadStatusRef.current);
              if (uploadStatusRef.current === 'success') {
                setUploadProgress(100);
              }
            }, 50);
            
            // Auto-close modal after 3 seconds and refresh structure
            setTimeout(() => {
              handleClose(); // handleClose already calls loadData()
            }, 3000);
          } else if (data.type === 'error') {
            setUploadMessages((prev) => [...prev, data.message]);
            setLatestMessage(data.message || 'Upload failed');
            setUploadStatus('error');
            setIsUploadComplete(false);
          } else if (data.type === 'pong') {
            // Heartbeat response
            console.log('Heartbeat pong received');
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          setUploadStatus('error');
          const errorMsg = 'WebSocket connection failed';
          setUploadMessages((prev) => [...prev, errorMsg]);
          setLatestMessage(errorMsg);
        }
      );

      // Store WebSocket reference so we can close it when modal closes
      uploadWebSocketRef.current = ws;

      // Prepare file paths
      const filePaths: string[] = [];
      files.forEach((file) => {
        const fileWithPath = file as File & { webkitRelativePath?: string };
        const relativePath = fileWithPath.webkitRelativePath || file.name;
        const pathParts = relativePath.split('/');
        pathParts.pop(); // Remove file name
        let folderPath = pathParts.join('/');
        
        if (currentPath) {
          folderPath = currentPath + '/' + folderPath;
        }
        
        filePaths.push(folderPath);
      });

      const startMsg = `Starting upload of ${files.length} files...`;
      setUploadMessages([startMsg]);
      setLatestMessage(startMsg);

      // Upload files
      await uploadFiles(files, filePaths, clientId);
      
      // Don't close WebSocket here - let it stay open until modal closes or upload completes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      const errorMsg = `Error: ${errorMessage}`;
      setUploadStatus('error');
      setUploadMessages((prev) => [...prev, errorMsg]);
      setLatestMessage(errorMsg);
      
      // Close WebSocket on error
      if (uploadWebSocketRef.current) {
        uploadWebSocketRef.current.close();
        uploadWebSocketRef.current = null;
      }
    }
  };

  const handleCancel = () => {
    // Close WebSocket if open (like in reference)
    if (uploadWebSocketRef.current) {
      uploadWebSocketRef.current.close();
      uploadWebSocketRef.current = null;
    }
    
    setIsUploadModalOpen(false);
    setUploadStatus('idle');
    setSelectedFiles(null);
    setUploadProgress(0);
    setUploadMessages([]);
    setLatestMessage('');
    setIsUploadComplete(false);
  };

  const handleTryAgain = () => {
    if (selectedFiles) {
      startUpload(Array.from(selectedFiles));
    }
  };

  const handleClose = () => {
    // Close WebSocket if open (like in reference)
    if (uploadWebSocketRef.current) {
      uploadWebSocketRef.current.close();
      uploadWebSocketRef.current = null;
    }
    
    setIsUploadModalOpen(false);
    setUploadStatus('idle');
    setSelectedFiles(null);
    setUploadProgress(0);
    setUploadMessages([]);
    setLatestMessage('');
    setIsUploadComplete(false);
    // Refresh data immediately to show new folder
    loadData();
  };

  // Generate breadcrumb
  const getBreadcrumbParts = () => {
    if (!currentPath) return [];
    return currentPath.split('/');
  };

  const navigateToBreadcrumb = (index: number) => {
    const parts = getBreadcrumbParts();
    const newPath = parts.slice(0, index + 1).join('/');
    navigateToFolder(newPath);
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Refresh Button */}
        <Button
          onClick={loadData}
          variant="outline"
          size="default"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Search Input and Upload Folder Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 w-80"
            />
          </div>
          {/* Only show Upload Folder button when exactly in accepted_invites folder (not subfolders) */}
          {currentPath === 'accepted_invites' && (
            <Button
              onClick={handleUploadClick}
              variant="default"
              size="default"
              className="flex items-center gap-2 bg-[#009689] hover:bg-[#007f75]"
            >
              <Upload className="h-4 w-4" />
              Upload Folder
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white rounded-lg border border-gray-200  p-4">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          {/* Navigation buttons */}
          <div className="flex items-center gap-2 pr-3 border-r border-gray-300 mr-2">
            <Button
              onClick={navigateBack}
              disabled={!canGoBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={navigateForward}
              disabled={!canGoForward}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={navigateToRoot}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7 px-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
          
          {/* <span
            onClick={navigateToRoot}
            className="text-[#009689] font-semibold cursor-pointer hover:underline flex items-center gap-1"
          >
            Neuralogic Drive
          </span> */}
          {getBreadcrumbParts().map((part, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="text-gray-400">›</span>
              {index === getBreadcrumbParts().length - 1 ? (
                <span className="text-gray-900 font-semibold">{part}</span>
              ) : (
                <span
                  onClick={() => navigateToBreadcrumb(index)}
                  className="text-[#009689] cursor-pointer hover:underline"
                >
                  {part}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Items count */}
      {/* <div className="flex items-center justify-between bg-gray-50 rounded px-4 py-2 text-sm text-gray-600">
        <span>
          {searchQuery.trim() !== '' 
            ? `${totalItems} result${totalItems !== 1 ? 's' : ''} found`
            : `${totalItems} item${totalItems !== 1 ? 's' : ''}`
          }
        </span>
      </div> */}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
          <p className="text-lg">Loading your files...</p>
        </div>
      ) : (
        <>
          {/* Folder List */}
          <FolderList
            items={displayedItems}
            onItemClick={handleItemClick}
            onDelete={handleDeleteClick}
            searchQuery={searchQuery}
            deletingItemPath={deletingItemPath}
            isDeleting={isDeleting}
          />

          {/* Pagination */}
          {/* {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )} */}
        </>
      )}

      {/* Upload Modal */}
      <AlertDialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>File Upload</AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="w-full">
            <label 
              htmlFor="folder-upload"
              className="block w-full cursor-pointer"
            >
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
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
            </label>
            {/* Hidden folder input */}
            <input
              type="file"
              id="folder-upload"
              onChange={handleFolderSelect}
              className="hidden"
              {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
            />
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Selected:</strong> {selectedFiles.length} files from folder
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {(uploadStatus === 'uploading' || uploadStatus === 'success') && (
              <div className="mt-4 space-y-3">
                {(() => {
                  // Only show 100% when status is actually 'success'
                  // During upload, cap at 99% to prevent glitch
                  const isSuccess = uploadStatus === 'success' || uploadStatusRef.current === 'success';
                  
                  let finalProgressValue: number;
                  if (isSuccess) {
                    // Only set to 100% when we have confirmed success
                    finalProgressValue = 100;
                  } else {
                    // During upload, use the progress value (already capped at 99% in handler)
                    finalProgressValue = Math.max(0, Math.min(99, uploadProgress));
                  }
                  
                  return (
                    <>
                      <Progress 
                        value={finalProgressValue} 
                        className="w-full" 
                      />
                      <p className="text-sm text-gray-600 text-center">
                        {isSuccess
                          ? `Upload complete: 100%`
                          : `Uploading folder... ${Math.round(finalProgressValue)}%`
                        }
                      </p>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Latest Progress Message - Single Line */}
            {latestMessage && (
              <div className="mt-4 bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-700 text-center">
                  {latestMessage}
                </p>
              </div>
            )}

            {/* Success Message */}
            {uploadStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  Upload Complete
                </p>
              </div>
            )}

            {/* Error Message */}
            {uploadStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 text-center">
                  {uploadMessages[uploadMessages.length - 1] || 'Error'}
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            
            {/* Try Again Button - shown on error */}
            {uploadStatus === 'error' && (
              <Button
                onClick={handleTryAgain}
                className="bg-[#009689] hover:bg-[#007f75]"
              >
                Try Again
              </Button>
            )}
            
            {/* Close Button - shown on success */}
            {uploadStatus === 'success' && (
              <Button
                onClick={handleClose}
                className="bg-[#009689] hover:bg-[#007f75]"
              >
                Close
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          // Prevent closing dialog while deleting
          if (!isDeleting) {
            setDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{itemToDelete?.name}</strong>?
              {itemToDelete?.item_type === 'folder' && (
                <span className="block mt-2 text-red-600">
                  This will delete the folder and all its contents.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              onClick={() => {
                if (!isDeleting) {
                  setDeleteDialogOpen(false);
                }
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
