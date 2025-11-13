import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 ml-20">
            <div className="">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}