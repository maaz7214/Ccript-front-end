import { getCurrentUser } from '@/app/actions/auth';
import FolderDetailsContent from '@/features/quantity-take-off/components/FolderDetailsContent';

interface FolderDetailsPageProps {
  params: Promise<{
    folderId: string;
  }>;
}

export default async function FolderDetailsPage({ params }: FolderDetailsPageProps) {
  const { folderId } = await params;
  const user = await getCurrentUser();
  const userName = user 
    ? (user.full_name || user.username || 'User')
    : 'User';

  // TODO: Fetch folder data from API using folderId
  // For now, extract folder name from localStorage or use a fallback
  // The FolderDetailsContent component will handle retrieving the name from localStorage

  return (
    <FolderDetailsContent 
      folderId={folderId}
      userName={userName}
    />
  );
}

