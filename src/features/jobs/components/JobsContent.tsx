'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import JobList from './JobList';
import JobFilters from './JobFilters';
import type { JobStatus, Job } from '@/types/jobs';
import { getJobStatus } from '@/lib/jobUtils';
import { loadJobsAction } from '../../../app/(main)/_actions/jobs';

interface JobsContentProps {
  userName: string;
  initialJobs: Job[];
}

export default function JobsContent({ userName, initialJobs }: JobsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<JobStatus | 'all'>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Sync jobs when initialJobs changes (from server re-render)
  useEffect(() => {
    console.log('=== Browser Console: Jobs API Response ===');
    console.log('API Endpoint: GET /api/jobs');
    console.log('Total Jobs:', initialJobs.length);
    console.log('Jobs Data:', initialJobs);
    console.log('==========================================');
    setJobs(initialJobs);
  }, [initialJobs]);

  // Fetch jobs from API when search query changes (with debouncing)
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      try {
        console.log('=== Browser Console: GET Request - Load Jobs ===');
        console.log('Search Query:', searchQuery || '(none)');
        console.log('API Endpoint: GET /api/jobs' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''));
        
        const fetchedJobs = await loadJobsAction(searchQuery);
        
        console.log('=== Browser Console: GET Response Data ===');
        console.log('Response Jobs Count:', fetchedJobs.length);
        console.log('Response Data:', fetchedJobs);
        
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Keep existing jobs on error
      } finally {
        setIsLoadingJobs(false);
      }
    };

    // Debounce search query to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, searchQuery ? 500 : 0); // 500ms delay when searching, immediate when clearing

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  // Search is handled server-side via API (searches by folder_name)
  // Use filteredJobs directly since API already filtered by folder name
  const searchFilteredJobs = filteredJobs;

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
          placeholder="Search by folder name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          disabled={isLoadingJobs}
        />
      </div>

      {/* Filter Tabs */}
      <JobFilters
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        counts={counts}
      />

      {/* Job List with Loading Overlay */}
      <div className="relative h-[500px]">
        {/* Loading Overlay */}
        {isLoadingJobs && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin text-[#009689]" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        )}
        <JobList jobs={searchFilteredJobs} />
      </div>

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


