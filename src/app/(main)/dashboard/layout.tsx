// import { Header, Sidebar } from '@/features/dashboard';
// import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
// import Footer from '@/components/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    // <ProtectedRoute>
    //   <div className="min-h-screen bg-gray-50 flex flex-col">
    //     <Header />
    //     <div className="flex flex-1">
    //       <Sidebar />
          // <main className="flex-1 p-6 ml-20 flex flex-col">
            <div className="flex-1">
              {children}
            </div>
          // </main>
    //         </div>
    //       </div>
    // </ProtectedRoute>
  );
}