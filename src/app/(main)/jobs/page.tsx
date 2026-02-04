import { getCurrentUser } from '../_actions/auth';
import { loadJobsAction } from '../_actions/jobs';
import JobsContent from '@/features/jobs/components/JobsContent';

export default async function JobsPage() {
  const user = await getCurrentUser();
  const userName = user 
    ? (user.full_name || user.username || 'User')
    : 'User';

  const jobs = await loadJobsAction();
  
  return <JobsContent userName={userName} initialJobs={jobs} />;
}

