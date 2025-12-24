import { getCurrentUser } from '@/app/actions/auth';
import JobsContent from '@/features/jobs/components/JobsContent';

export default async function JobsPage() {
  const user = await getCurrentUser();
  const userName = user 
    ? (user.full_name || user.username || 'User')
    : 'User';

  return <JobsContent userName={userName} />;
}

