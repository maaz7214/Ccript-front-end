'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '../../../app/(main)/_actions/auth';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) {
      return;
    }

    try {
      // Call server action to clear cookies
      const result = await logoutAction();
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        
        // Call logout endpoint (optional, just for logging)
        if (token) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
              },
            });
          } catch (error) {
            console.log('Logout endpoint error:', error);
          }
        }
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }

      // Redirect to login page
      if (result.redirectTo) {
        router.push(result.redirectTo);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear localStorage and redirect even if there's an error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
      router.push('/login');
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}

