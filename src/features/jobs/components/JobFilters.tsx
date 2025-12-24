'use client';

import type { JobStatus } from '@/types/jobs';

interface JobFiltersProps {
  selectedFilter: JobStatus | 'all';
  onFilterChange: (filter: JobStatus | 'all') => void;
  counts: {
    all: number;
    'in-progress': number;
    queued: number;
    completed: number;
    failed: number;
  };
}

export default function JobFilters({ selectedFilter, onFilterChange, counts }: JobFiltersProps) {
  const filters: Array<{ key: JobStatus | 'all'; label: string }> = [
    { key: 'all', label: 'All Jobs' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'queued', label: 'Queued' },
    { key: 'completed', label: 'Completed' },
    { key: 'failed', label: 'Failed' },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => {
        const count = counts[filter.key];
        const isActive = selectedFilter === filter.key;

        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`
              px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-all
              ${isActive
                ? 'bg-[#009689] border border-[#009689] text-white shadow-sm'
                : 'border border-[#009689] text-[#009689] hover:bg-green-100'
              }
            `}
          >
            {filter.label} ({count})
          </button>
        );
      })}
    </div>
  );
}


