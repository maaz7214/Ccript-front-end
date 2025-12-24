export type JobStatus = 'queued' | 'in-progress' | 'completed' | 'failed';

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  jobId: string;
  createdAt: Date;
  completedAt?: Date;
  progress?: number;
  error?: string;
}


