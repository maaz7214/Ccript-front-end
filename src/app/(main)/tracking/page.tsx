import TrackingTable from '@/features/tracking/components/TrackingTable';
import { loadTrackingAction } from '../_actions/tracking';

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
    <div className="space-y-6 max-w-full flex-1 overflow-y-auto">
      <TrackingTable initialData={data} initialSearch={search} />
    </div>
  );
}
