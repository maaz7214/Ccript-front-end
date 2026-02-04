import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import Footer from '@/components/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
        <Header />
        <div className="flex flex-1 min-w-0">
          <Sidebar />
          <main className="flex-1 p-6 ml-20 flex flex-col min-w-0 overflow-x-hidden pb-20">
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}