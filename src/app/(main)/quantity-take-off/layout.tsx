// import { Header, Sidebar } from '@/features/dashboard';
// import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import { JobsProvider } from '@/contexts/JobsContext';
// import Footer from '@/components/Footer';

interface QuantityTakeOffLayoutProps {
  children: React.ReactNode;
}

export default function QuantityTakeOffLayout({ children }: QuantityTakeOffLayoutProps) {
  return (
    // <ProtectedRoute>
      <JobsProvider>
        <div className="w-full min-w-0 overflow-x-hidden">
          {children}
        </div>
      </JobsProvider>
    // </ProtectedRoute>
  );
}

