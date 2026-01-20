import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import { JobsProvider } from '@/contexts/JobsContext';
import Footer from '@/components/Footer';

interface JobsLayoutProps {
  children: React.ReactNode;
}

export default function JobsLayout({ children }: JobsLayoutProps) {
  return (
    <ProtectedRoute>
      <JobsProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 ml-20 flex flex-col">
              <div className="flex-1">
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

