import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import TrackingTable from '@/features/tracking/components/TrackingTable';
import { loadTrackingAction } from '@/app/actions/tracking';
import Footer from '@/components/Footer';

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 ml-20 overflow-hidden flex flex-col">
            <div className="space-y-6 max-w-full flex-1 overflow-y-auto">
              <TrackingTable initialData={data} initialSearch={search} />
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
