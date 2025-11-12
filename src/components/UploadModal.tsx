'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Upload } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFiles: FileList | null;
  onFolderSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadProgress: number;
  onCancel: () => void;
  onTryAgain: () => void;
  onClose: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function UploadModal({
  isOpen,
  onOpenChange,
  selectedFiles,
  onFolderSelect,
  uploadStatus,
  uploadProgress,
  onCancel,
  onTryAgain,
  onClose,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop
}: UploadModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>File Upload</AlertDialogTitle>
          {/* <AlertDialogDescription>
            Select a folder to upload to your dashboard
          </AlertDialogDescription> */}
        </AlertDialogHeader>
        
        <div className="w-full">
          <label 
            htmlFor="folder-upload"
            className="block w-full cursor-pointer"
          >
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
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
            onChange={onFolderSelect}
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
          {uploadStatus === 'uploading' && (
            <div className="mt-4 space-y-3">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600 text-center">
                Uploading folder... {uploadProgress}%
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
                Error
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          {/* Try Again Button - shown on error */}
          {uploadStatus === 'error' && (
            <Button
              onClick={onTryAgain}
              className="bg-[#009689] hover:bg-[#007f75]"
            >
              Try Again
            </Button>
          )}
          
          {/* Close Button - shown on success */}
          {uploadStatus === 'success' && (
            <Button
              onClick={onClose}
              className="bg-[#009689] hover:bg-[#007f75]"
            >
              Close
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}