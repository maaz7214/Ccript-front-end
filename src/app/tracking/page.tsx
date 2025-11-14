import { Suspense } from 'react';
import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import TrackingTable from '@/features/tracking/components/TrackingTable';
import { loadTrackingAction } from '@/app/actions/tracking';
import { RefreshCw } from 'lucide-react';

interface TrackingPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

// Loading component similar to dashboard
function TrackingLoading() {
  return (
    <div className="space-y-6">
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
  );
}

// Server component that fetches data
async function TrackingContent({ search }: { search: string }) {
  // Load data server-side using server action
  const data = await loadTrackingAction(search);

  return <TrackingTable initialData={data} initialSearch={search} />;
}

export default async function TrackingPage({ searchParams }: TrackingPageProps) {
  // Await searchParams as it's now a Promise in Next.js 15+
  const params = await searchParams;
  const search = params.search || '';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 ml-20 overflow-hidden">
            <div className="space-y-6 max-w-full">
              <Suspense fallback={<TrackingLoading />}>
                <TrackingContent search={search} />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
