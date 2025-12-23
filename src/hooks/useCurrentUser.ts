'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';

interface User {
  id?: number;
  email?: string;
  username?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // Try localStorage first
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setLoading(false);
          return;
        } catch (e) {
          // Invalid JSON, continue to API call
        }
      }

      // Fetch from API if not in localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl('/api/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const userName = currentUser 
    ? (currentUser.full_name || currentUser.username || 'User')
    : 'User';

  return { currentUser, loading, userName };
}

