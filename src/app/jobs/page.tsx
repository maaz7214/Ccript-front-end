import { getCurrentUser } from '@/app/actions/auth';
import { loadJobsAction } from '@/app/actions/jobs';
import JobsContent from '@/features/jobs/components/JobsContent';

export default async function JobsPage() {
  const user = await getCurrentUser();
  const userName = user 
    ? (user.full_name || user.username || 'User')
    : 'User';

  const jobs = await loadJobsAction();
console.log(jobs);
  return <JobsContent userName={userName} initialJobs={jobs} />;
}

