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
      const result = await logoutAction();
      if (result.success) {
        // Redirect to login page
        if (result.redirectTo) {
          router.push(result.redirectTo);
        } else {
          router.push('/login');
        }
      } else {
        console.error('Logout failed:', result.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
      setIsPopupOpen(false);
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