import { getCurrentUser } from '@/app/actions/auth';
import QuantityTakeOffContent from '@/features/quantity-take-off/components/QuantityTakeOffContent';
import type { FolderCardData } from '@/features/quantity-take-off/components/FolderCard';

export default async function QuantityTakeOffPage() {
  const user = await getCurrentUser();
  const userName = user 
    ? (user.full_name || user.username || 'User')
    : 'User';

  // TODO: Replace with actual data from your API
  const initialFolders: FolderCardData[] = [
    {
      id: '1',
      name: 'LakeTran HQ',
      date: 'June 25, 2025',
      size: '390.5mb',
      isNew: true,
    },
    {
      id: '2',
      name: 'Chase Bank Char...',
      date: 'June 25, 2025',
      size: '390.5mb',
      isNew: true,
    },
    {
      id: '3',
      name: 'LKCO',
      date: 'June 25, 2025',
      size: '390.5mb',
    },
    {
      id: '4',
      name: "Aaron's Rentals",
      date: 'June 25, 2025',
      size: '390.5mb',
    },
    {
      id: '5',
      name: 'Project Alpha',
      date: 'June 24, 2025',
      size: '250.3mb',
    },
    {
      id: '6',
      name: 'LakeTran HQ',
      date: 'June 25, 2025',
      size: '390.5mb',
      isNew: true,
    },
    {
      id: '7',
      name: 'Chase Bank Char...',
      date: 'June 25, 2025',
      size: '390.5mb',
      isNew: true,
    },
    {
      id: '8',
      name: 'Project Beta',
      date: 'June 23, 2025',
      size: '180.2mb',
    },
    {
      id: '9',
      name: 'Corporate Files',
      date: 'June 22, 2025',
      size: '520.1mb',
    },
    {
      id: '10',
      name: 'Client Documents',
      date: 'June 21, 2025',
      size: '310.7mb',
    },
    {
      id: '11',
      name: 'Client Documents',
      date: 'June 21, 2025',
      size: '310.7mb',
    },
    {
      id: '12',
      name: 'Client Documents',
      date: 'June 21, 2025',
      size: '310.7mb',
    },
    {
      id: '13',
      name: 'Client Documents',
      date: 'June 21, 2025',
      size: '310.7mb',
    },
    
  ];

  return (
    <QuantityTakeOffContent 
      initialFolders={initialFolders}
      userName={userName}
    />
  );
}

