import type { Job, JobStatus } from '@/types/jobs';

/**
 * Map API status string to JobStatus type
 */
export function mapApiStatusToJobStatus(apiStatus: string): JobStatus {
  const statusMap: Record<string, JobStatus> = {
    'completed': 'completed',
    'in-progress': 'in-progress',
    'in_progress': 'in-progress',
    'queued': 'queued',
    'failed': 'failed',
    'error': 'failed',
  };
  
  return statusMap[apiStatus.toLowerCase()] || 'queued';
}

/**
 * Format file size from bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)}${sizes[i]}`;
}

/**
 * Format time ago from date string
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Get job status for filtering
 */
export function getJobStatus(job: Job): JobStatus {
  return mapApiStatusToJobStatus(job.status);
}

