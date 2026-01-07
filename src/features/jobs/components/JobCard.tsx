'use client';

import { Clock, CheckCircle2, XCircle, Calendar, ChevronDown, Sparkles, User, Folder, FileText } from 'lucide-react';
import type { Job } from '@/types/jobs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getJobStatus, formatFileSize, formatTimeAgo } from '@/lib/jobUtils';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const status = getJobStatus(job);
  
  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          icon: Clock,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50',
          badgeText: 'Queued',
          badgeColor: 'bg-[#009689] text-white',
          subStatusIcon: null,
          subStatusText: null,
        };
      case 'in-progress':
        return {
          icon: Sparkles,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          badgeText: 'In progress',
          badgeColor: 'bg-[#009689] text-white',
          subStatusIcon: Sparkles,
          subStatusText: 'Plans in Progress',
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          badgeText: 'Completed',
          badgeColor: 'bg-green-500 text-white',
          subStatusIcon: null,
          subStatusText: null,
        };
      case 'failed':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          badgeText: 'Failed',
          badgeColor: 'bg-red-500 text-white',
          subStatusIcon: null,
          subStatusText: null,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const SubStatusIcon = config.subStatusIcon;
  const timeAgo = formatTimeAgo(job.created_at);
  const folderSizeFormatted = formatFileSize(job.folder_size);
  const jobId = `job-${String(job.job_id).padStart(3, '0')}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`job-${job.job_id}`} className="border-0">
          <AccordionTrigger className="px-4 py-4 hover:no-underline">
            <div className="flex items-center justify-between gap-4 w-full">
              {/* Left Side - Icon and Job Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`p-2.5 rounded-lg ${config.bgColor} shrink-0`}>
                  <Icon className={`h-6 w-6 ${config.iconColor} ${status === 'in-progress' ? 'animate-pulse' : ''}`} />
                </div>
                <h3 className="font-semibold text-gray-900 truncate">{job.folder_name}</h3>
              </div>

              {/* Right Side - Status Badge */}
              <div className={`px-3 py-1.5  rounded-full text-xs font-medium flex items-center gap-1.5 shrink-0 ${config.badgeColor}`}>
                {config.badgeText}
              </div>
                <ChevronDown className="h-3 w-3 cursor-pointer transition-transform duration-200" />
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-4">
            <div className="pt-4 space-y-4">
              {/* Expanded Content - Light Green Box with "Plans in Progress" */}
              {config.subStatusText && SubStatusIcon && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-1.5">
                    <SubStatusIcon className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="text-sm text-green-700 font-medium">{config.subStatusText}</span>
                  </div>
                </div>
              )}

              {/* Message from API */}
              {job.message && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-700">{job.message}</span>
                  </div>
                </div>
              )}

              {/* Job Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Uploaded By */}
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">
                    <span className="text-gray-500">Uploaded by:</span> {job.uploaded_by}
                  </span>
                </div>

                {/* Folder Size */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Folder className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>
                    <span className="text-gray-500">Size:</span> {folderSizeFormatted}
                  </span>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>
                    <span className="text-gray-500">Created:</span> {timeAgo}
                  </span>
                </div>

                {/* Job ID */}
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-500">Job ID:</span>
                  <span className="font-mono text-xs">{jobId}</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


