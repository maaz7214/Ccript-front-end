'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

interface UserAvatarProps {
  userInitials: string;
  userName: string;
}

export default function UserAvatar({ userInitials, userName }: UserAvatarProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  const handleAvatarClick = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear localStorage first
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
      
      // Call server action to clear cookies
      try {
        await logoutAction();
      } catch (error) {
        console.error('Logout action error:', error);
      }
      
      // Force a full page redirect to login - this ensures all state is cleared
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear localStorage and redirect even if there's an error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
    }
  };

  return (
    <div className="relative" ref={popupRef}>
      {/* User Avatar */}
      <div 
        className="w-10 h-10 bg-[#009689] text-white rounded-full flex items-center justify-center text-sm font-medium cursor-pointer hover:bg-[#007f75] transition-colors"
        title={userName}
        onClick={handleAvatarClick}
      >
        {userInitials}
      </div>

      {/* Popup Menu */}
      {isPopupOpen && (
        <div className="absolute right-0 top-12 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
          <div className="p-2">
            <Button
              onClick={handleLogout}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoading ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}