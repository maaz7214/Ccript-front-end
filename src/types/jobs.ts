export type JobStatus = 'queued' | 'in-progress' | 'completed' | 'failed';

/**
 * Job type matching the API response from /api/jobs
 */
export interface Job {
  job_id: number;
  folder_id: number;
  folder_name: string;
  folder_size: number;
  status: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  message: string;
}


