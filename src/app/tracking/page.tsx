import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import TrackingTable from '@/features/tracking/components/TrackingTable';
import { loadTrackingAction } from '@/app/actions/tracking';

interface TrackingPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function TrackingPage({ searchParams }: TrackingPageProps) {

  const params = await searchParams;
  const search = params.search || '';

  const data = await loadTrackingAction(search);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 ml-20 overflow-hidden">
            <div className="space-y-6 max-w-full">
              <TrackingTable initialData={data} initialSearch={search} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
