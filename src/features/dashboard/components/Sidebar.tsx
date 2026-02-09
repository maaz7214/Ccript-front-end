'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  activeIcon: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: '/dashboard-icon.svg',
    activeIcon: '/dashboard-icon-active.svg',
  },
  {
    id: 'quantity-take-off',
    label: 'Qto',
    href: '/quantity-take-off',
    icon: '/qto.svg',
    activeIcon: '/qto-active.svg',
  },
  {
    id: 'tracking',
    label: 'Tracking',
    href: '/tracking',
    icon: '/tracking-icon.svg',
    activeIcon: '/tracking-icon-active.svg',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (href === '/quantity-take-off') {
      // Match both /quantity-take-off and /quantity-take-off/[folderId]
      return pathname.startsWith('/quantity-take-off');
    }
    if (href === '/tracking') {
      return pathname === '/tracking';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-20 shrink-0">
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-10">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const active = isActive(item.href);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    w-full flex flex-col cursor-pointer items-center gap-2 p-3 rounded-lg transition-all duration-200
                    ${active 
                      ? 'bg-[#0D0D0D] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  title={item.label}
                >
                  <div className="relative w-6 h-6">
                    <Image
                      src={active ? item.activeIcon : item.icon}
                      alt={item.label}
                      width={24}
                      height={24}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}