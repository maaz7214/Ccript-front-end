import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import { RefreshCw } from 'lucide-react';

export default function TrackingLoading() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 ml-20 overflow-hidden">
            <div className="space-y-6 max-w-full">
              {/* Header skeleton */}
              <div className="flex items-center justify-between w-full max-w-full">
                <h1 className="text-2xl font-bold text-gray-900">
                  Project Invites Tracker
                </h1>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="h-10 w-80 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Loading state */}
              <div className="text-center py-20 text-gray-500">
                <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-lg">Loading tracking data...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

