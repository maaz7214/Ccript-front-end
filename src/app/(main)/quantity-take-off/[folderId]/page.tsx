import { getCurrentUser } from '../../_actions/auth';
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


  return (
    <FolderDetailsContent 
      folderId={folderId}
      userName={userName}
    />
  );
}

