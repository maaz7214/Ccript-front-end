'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import JobList from './JobList';
import JobFilters from './JobFilters';
import type { JobStatus, Job } from '@/types/jobs';
import { getJobStatus } from '@/lib/jobUtils';

interface JobsContentProps {
  userName: string;
  initialJobs: Job[];
}

export default function JobsContent({ userName, initialJobs }: JobsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<JobStatus | 'all'>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  // Sync jobs when initialJobs changes (from server re-render)
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  // Filter jobs by status
  const getJobsByStatus = (status: JobStatus | 'all'): Job[] => {
    if (status === 'all') return jobs;
    return jobs.filter((job) => getJobStatus(job) === status);
  };

  // Get job counts
  const getJobCounts = () => {
    return {
      all: jobs.length,
      'in-progress': jobs.filter((job) => getJobStatus(job) === 'in-progress').length,
      queued: jobs.filter((job) => getJobStatus(job) === 'queued').length,
      completed: jobs.filter((job) => getJobStatus(job) === 'completed').length,
      failed: jobs.filter((job) => getJobStatus(job) === 'failed').length,
    };
  };

  const filteredJobs = getJobsByStatus(selectedFilter);
  const counts = getJobCounts();

  // Filter jobs by search query
  const searchFilteredJobs = filteredJobs.filter(
    (job) =>
      job.folder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `job-${String(job.job_id).padStart(3, '0')}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearJobs = () => {
    // Note: This would need a delete API endpoint to actually clear jobs
    // For now, we'll just clear the local state
    setJobs([]);
    setShowClearDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
          <p className="text-gray-600">Monitor and manage all your processing jobs</p>
        </div>
        {/* {counts.all > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowClearDialog(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Jobs
          </Button>
        )} */}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by job name, ID, or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <JobFilters
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        counts={counts}
      />

      {/* Job List */}
      <JobList jobs={searchFilteredJobs} />

      {/* Clear Jobs Confirmation Dialog */}
      {/* <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Jobs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all jobs from the list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearJobs}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}


