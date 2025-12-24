'use client';

/**
 * JobsContext - Manages job state and lifecycle
 * 
 * This context provides:
 * - Job creation with automatic progression simulation
 * - Job status updates and progress tracking
 * - LocalStorage persistence for job data
 * - Filtering and counting utilities
 * 
 * Job Lifecycle:
 * 1. Queued - Initial state when job is created
 * 2. In Progress - After 1 second, starts processing with progress updates
 * 3. Completed/Failed - After progress reaches 100% (90% success rate)
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import type { Job, JobStatus } from '@/types/jobs';

// Constants for job simulation
const STORAGE_KEY = 'jobs';
const QUEUE_TO_PROGRESS_DELAY = 1000; // 1 second delay before starting
const PROGRESS_UPDATE_INTERVAL = 500; // Update every 500ms
const PROGRESS_INCREMENT_MAX = 15; // Max progress increase per update
const SUCCESS_RATE = 0.9; // 90% success rate

interface JobsContextType {
  jobs: Job[];
  addJob: (name: string) => Job;
  updateJobStatus: (jobId: string, status: JobStatus, progress?: number, error?: string) => void;
  clearJobs: () => void;
  getJobsByStatus: (status: JobStatus | 'all') => Job[];
  getJobCounts: () => {
    all: number;
    'in-progress': number;
    queued: number;
    completed: number;
    failed: number;
  };
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

/**
 * Helper function to load jobs from localStorage
 * Converts date strings back to Date objects
 */
function loadJobsFromStorage(): Job[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((job: any) => ({
      ...job,
      createdAt: new Date(job.createdAt),
      completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
    }));
  } catch (error) {
    console.error('Error loading jobs from storage:', error);
    return [];
  }
}

/**
 * Helper function to save jobs to localStorage
 */
function saveJobsToStorage(jobs: Job[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }
}

/**
 * Helper function to generate a unique job ID
 */
function generateJobId(jobNumber: number): string {
  return `job-${String(jobNumber).padStart(3, '0')}`;
}

/**
 * Helper function to generate a unique internal ID
 */
function generateInternalId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * JobsProvider - Provides job management functionality to the app
 */
export function JobsProvider({ children }: { children: ReactNode }) {
  // Initialize jobs from localStorage on mount
  const [jobs, setJobs] = useState<Job[]>(loadJobsFromStorage);
  
  // Track active intervals to prevent memory leaks
  const activeIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Persist jobs to localStorage whenever they change
  useEffect(() => {
    saveJobsToStorage(jobs);
  }, [jobs]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      activeIntervalsRef.current.forEach((interval) => clearInterval(interval));
      activeIntervalsRef.current.clear();
    };
  }, []);

  /**
   * Creates a new job and simulates its progression
   * 
   * Flow:
   * 1. Creates job with 'queued' status
   * 2. After 1 second, changes to 'in-progress'
   * 3. Updates progress every 500ms until 100%
   * 4. Randomly completes (90%) or fails (10%)
   */
  const addJob = useCallback((name: string): Job => {
    const jobNumber = jobs.length + 1;
    const newJob: Job = {
      id: generateInternalId(),
      name,
      status: 'queued',
      jobId: generateJobId(jobNumber),
      createdAt: new Date(),
    };

    // Add job to the beginning of the list (most recent first)
    setJobs((prev) => [newJob, ...prev]);

    // Start job progression after a delay
    const startTimeout = setTimeout(() => {
      // Change status to in-progress
      setJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id 
            ? { ...job, status: 'in-progress', progress: 0 } 
            : job
        )
      );

      // Simulate progress updates
      let currentProgress = 0;
      const intervalId = setInterval(() => {
        // Increment progress randomly
        currentProgress += Math.random() * PROGRESS_INCREMENT_MAX;
        
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(intervalId);
          activeIntervalsRef.current.delete(newJob.id);
          
          // Determine success or failure (90% success rate)
          const isSuccess = Math.random() > (1 - SUCCESS_RATE);
          
          setJobs((prev) =>
            prev.map((job) =>
              job.id === newJob.id
                ? {
                    ...job,
                    status: isSuccess ? 'completed' : 'failed',
                    progress: 100,
                    completedAt: new Date(),
                    error: isSuccess ? undefined : 'Processing failed',
                  }
                : job
            )
          );
        } else {
          // Update progress
          setJobs((prev) =>
            prev.map((job) =>
              job.id === newJob.id 
                ? { ...job, progress: currentProgress } 
                : job
            )
          );
        }
      }, PROGRESS_UPDATE_INTERVAL);

      // Store interval reference for cleanup
      activeIntervalsRef.current.set(newJob.id, intervalId);
    }, QUEUE_TO_PROGRESS_DELAY);

    return newJob;
  }, [jobs.length]);

  /**
   * Updates a specific job's status, progress, and error
   */
  const updateJobStatus = useCallback(
    (jobId: string, status: JobStatus, progress?: number, error?: string) => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.id !== jobId) return job;

          return {
            ...job,
            status,
            progress: progress !== undefined ? progress : job.progress,
            error,
            completedAt: 
              status === 'completed' || status === 'failed' 
                ? new Date() 
                : job.completedAt,
          };
        })
      );
    },
    []
  );

  /**
   * Filters jobs by status
   * Returns all jobs if status is 'all'
   */
  const getJobsByStatus = useCallback(
    (status: JobStatus | 'all'): Job[] => {
      if (status === 'all') return jobs;
      return jobs.filter((job) => job.status === status);
    },
    [jobs]
  );

  /**
   * Returns counts of jobs by status
   */
  const getJobCounts = useCallback(() => {
    return {
      all: jobs.length,
      'in-progress': jobs.filter((job) => job.status === 'in-progress').length,
      queued: jobs.filter((job) => job.status === 'queued').length,
      completed: jobs.filter((job) => job.status === 'completed').length,
      failed: jobs.filter((job) => job.status === 'failed').length,
    };
  }, [jobs]);

  /**
   * Clears all jobs from state and localStorage
   */
  const clearJobs = useCallback(() => {
    // Clear all active intervals
    activeIntervalsRef.current.forEach((interval) => clearInterval(interval));
    activeIntervalsRef.current.clear();
    
    // Clear state and storage
    setJobs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <JobsContext.Provider
      value={{
        jobs,
        addJob,
        updateJobStatus,
        clearJobs,
        getJobsByStatus,
        getJobCounts,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

/**
 * Hook to access jobs context
 * Must be used within a JobsProvider
 */
export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}

