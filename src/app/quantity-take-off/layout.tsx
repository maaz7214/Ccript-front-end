import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import { JobsProvider } from '@/contexts/JobsContext';
import Footer from '@/components/Footer';

interface QuantityTakeOffLayoutProps {
  children: React.ReactNode;
}

export default function QuantityTakeOffLayout({ children }: QuantityTakeOffLayoutProps) {
  return (
    <ProtectedRoute>
      <JobsProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-4 ml-20 overflow-hidden flex flex-col">
              <div className="w-full max-w-none flex-1 overflow-y-auto">
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </div>
      </JobsProvider>
    </ProtectedRoute>
  );
}

