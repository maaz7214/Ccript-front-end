'use client';

import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useJobs } from '@/contexts/JobsContext';
import JobList from './JobList';
import JobFilters from './JobFilters';
import type { JobStatus } from '@/types/jobs';

interface JobsContentProps {
  userName: string;
}

export default function JobsContent({ userName }: JobsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<JobStatus | 'all'>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { getJobsByStatus, getJobCounts, clearJobs } = useJobs();

  const jobs = getJobsByStatus(selectedFilter);
  const counts = getJobCounts();

  // Filter jobs by search query
  const filteredJobs = jobs.filter(
    (job) =>
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearJobs = () => {
    clearJobs();
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
        {counts.all > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowClearDialog(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Jobs
          </Button>
        )}
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
      <JobList jobs={filteredJobs} />

      {/* Clear Jobs Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
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
      </AlertDialog>
    </div>
  );
}


