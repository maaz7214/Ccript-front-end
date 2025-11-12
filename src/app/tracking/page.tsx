import { Header, Sidebar } from '@/features/dashboard';

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-20">
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                  Tracking Dashboard
                </h1>
                <p className="text-gray-600 mb-8">
                  Monitor and track your shipments and deliveries
                </p>
                
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Coming Soon
                    </h3>
                    <p className="text-gray-600">
                      Tracking functionality is currently under development. 
                      Stay tuned for real-time shipment tracking features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}