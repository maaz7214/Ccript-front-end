import { getCurrentUser } from '@/app/actions/auth';
import { loadFoldersAction } from '@/app/actions/folders';
import QuantityTakeOffContent from '@/features/quantity-take-off/components/QuantityTakeOffContent';

export default async function QuantityTakeOffPage() {
  const user = await getCurrentUser();
  const userName = user 
    ? (user.full_name || user.username || 'User')
    : 'User';

  const initialFolders = await loadFoldersAction();
  console.log(initialFolders);
  return (
    <QuantityTakeOffContent 
      initialFolders={initialFolders}
      userName={userName}
    />
  );
}

