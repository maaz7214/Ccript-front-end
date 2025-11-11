import Image from 'next/image';
import { getCurrentUser } from '@/app/actions/auth';
import { generateUserInitials, generateInitialsFromEmail } from '../utils/userUtils';

export default async function Header() {
  // Fetch current user data
  const currentUser = await getCurrentUser();
  
  // Generate user initials and name
  let userInitials = 'U'; // Default fallback
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
            alt="Tumlinson Electric Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <h1 className="text-xl font-semibold text-gray-900">
            Tumlinson Electric
          </h1>
        </div>

        {/* Right side - User Avatar */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div 
              className="w-10 h-10 bg-[#009689] text-white rounded-full flex items-center justify-center text-sm font-medium"
              title={userName}
            >
              {userInitials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}