import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import { JobsProvider } from '@/contexts/JobsContext';

interface QuantityTakeOffLayoutProps {
  children: React.ReactNode;
}

export default function QuantityTakeOffLayout({ children }: QuantityTakeOffLayoutProps) {
  return (
    <ProtectedRoute>
      <JobsProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-4 ml-20 overflow-hidden">
              <div className="w-full max-w-none">
                {children}
              </div>
            </main>
          </div>
        </div>
      </JobsProvider>
    </ProtectedRoute>
  );
}

