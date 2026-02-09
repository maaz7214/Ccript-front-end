'use client';

import { useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInferenceStatusAction, type InferenceStatusResponse } from '@/app/(main)/_actions/folders';

interface InferenceStatusModalProps {
  folderName: string;
  folderId: string;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (folderId: string) => void;
}

export default function InferenceStatusModal({
  folderName,
  folderId,
  isOpen,
  onClose,
  onCompleted,
}: InferenceStatusModalProps) {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      // Stop polling when modal closes
      if (pollingIntervalRef.current) {
        console.log('[InferenceStatusModal] Stopping polling - modal closed');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      isPollingRef.current = false;
      return;
    }

    // Start polling when modal opens
    console.log('[InferenceStatusModal] Starting polling for folder:', folderName);
    isPollingRef.current = true;
    let pollCount = 0;
    
    const pollStatus = async () => {
      if (!isPollingRef.current) {
        console.log('[InferenceStatusModal] Polling stopped (isPollingRef is false)');
        return;
      }

      pollCount++;
      console.log(`[InferenceStatusModal] Poll #${pollCount} - Checking status for folder: ${folderName}`);

      try {
        const status: InferenceStatusResponse = await getInferenceStatusAction(folderName);
        
        console.log(`[InferenceStatusModal] Poll #${pollCount} - Status received:`, {
          status: status.status,
          job_id: status.job_id,
          total_drawings: status.total_drawings,
          total_symbols: status.total_symbols,
          created_at: status.created_at,
          completed_at: status.completed_at,
          error: status.error,
        });
        
        if (status.status === 'completed') {
          console.log('[InferenceStatusModal] ✅ Job completed! Navigating to folder details...');
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          isPollingRef.current = false;
          
          // Navigate to folder details
          onCompleted(folderId);
        } else if (status.status === 'failed') {
          console.error('[InferenceStatusModal] ❌ Job failed:', status.error);
          // Stop polling on failure
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          isPollingRef.current = false;
          
          // Show error and close
          alert(`Inference job failed: ${status.error || 'Unknown error'}`);
          onClose();
        } else {
          console.log(`[InferenceStatusModal] ⏳ Job ${status.status} - continuing to poll...`);
        }
        // If status is 'queued' or 'processing', continue polling
      } catch (error) {
        console.error(`[InferenceStatusModal] ⚠️ Poll #${pollCount} - Error:`, error);
        // Continue polling even on error (might be temporary network issue)
      }
    };

    // Poll immediately, then every 2 seconds
    console.log('[InferenceStatusModal] Initiating first poll...');
    pollStatus();
    pollingIntervalRef.current = setInterval(pollStatus, 2000);

    return () => {
      console.log('[InferenceStatusModal] Cleanup - stopping polling');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      isPollingRef.current = false;
    };
  }, [isOpen, folderName, folderId, onClose, onCompleted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={() => {
            console.log('[InferenceStatusModal] User clicked close button - stopping polling');
            isPollingRef.current = false;
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#0D0D0D]/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#0D0D0D] animate-spin" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing Inference Job
            </h3>
            <p className="text-sm text-gray-600">
              Folder: <span className="font-medium">{folderName}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              In process, please wait...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
