import { Header, Sidebar } from '@/features/dashboard';
import ProtectedRoute from '@/features/dashboard/components/ProtectedRoute';
import { JobsProvider } from '@/contexts/JobsContext';
// import Footer from '@/components/Footer';

interface JobsLayoutProps {
  children: React.ReactNode;
}

export default function JobsLayout({ children }: JobsLayoutProps) {
  return (
    // <ProtectedRoute>
      <JobsProvider>
              <div className="flex-1">
                {children}
              </div>
      </JobsProvider>
    // </ProtectedRoute>
  );
}

