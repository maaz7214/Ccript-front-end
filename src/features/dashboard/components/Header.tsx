'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { generateUserInitials, generateInitialsFromEmail } from '../utils/userUtils';
import UserAvatar from './UserAvatar';
import { getApiUrl } from '@/lib/api';

interface User {
  id?: number;
  email?: string;
  username?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export default function Header() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // First try to get from localStorage
        if (typeof window !== 'undefined') {
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

          // If not in localStorage, fetch from API
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
              // Token expired or invalid - clear and redirect
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');
              window.location.href = '/login';
            } else {
              // Other error, just clear token
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');
            }
          } catch (error) {
            console.error('Error loading user:', error);
            // On error, clear token to be safe
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Error in loadCurrentUser:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  // Generate user initials and name
  let userInitials = 'U';
  let userName = 'User';
  
  if (currentUser) {
    userName = currentUser.full_name || currentUser.username || 'User';
    
    if (currentUser.full_name && currentUser.full_name.trim() !== '') {
      userInitials = generateUserInitials(currentUser.full_name);
    } else if (currentUser.email) {
      userInitials = generateInitialsFromEmail(currentUser.email);
    } else if (currentUser.username) {
      userInitials = generateUserInitials(currentUser.username);
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Company Name */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.svg"
            alt="CCRIPT Agency Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <h1 className="text-xl font-semibold text-gray-900">
            CCRIPT Agency
          </h1>
        </div>

        {/* Right side - User Avatar */}
        <div className="flex items-center space-x-2">
          {!loading && (
            <UserAvatar 
              userInitials={userInitials}
              userName={userName}
            />
          )}
        </div>
      </div>
    </header>
  );
}