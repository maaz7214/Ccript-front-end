'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/login');
          return;
        }
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (when logout clears localStorage in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && !e.newValue) {
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  return { isAuthenticated, loading };
}

