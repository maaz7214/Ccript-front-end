import { Header } from '@/features/dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Dashboard</h1>
        <p className="text-gray-600">This is the main dashboard page.</p>
      </main>
    </div>
  );
}