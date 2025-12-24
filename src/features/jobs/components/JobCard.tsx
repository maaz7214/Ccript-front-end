'use client';

import { Clock, Loader2, CheckCircle2, XCircle, Calendar, ChevronDown, Sparkles } from 'lucide-react';
import type { Job } from '@/types/jobs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const getStatusConfig = () => {
    switch (job.status) {
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

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const SubStatusIcon = config.subStatusIcon;
  const timeAgo = formatTimeAgo(job.createdAt);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={job.id} className="border-0">
          <AccordionTrigger className="px-4 py-4 hover:no-underline">
            <div className="flex items-center justify-between gap-4 w-full">
              {/* Left Side - Icon and Job Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`p-2.5 rounded-lg ${config.bgColor} shrink-0`}>
                  <Icon className={`h-6 w-6 ${config.iconColor} ${job.status === 'in-progress' ? 'animate-pulse' : ''}`} />
                </div>
                <h3 className="font-semibold text-gray-900 truncate">{job.name}</h3>
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

              {/* Metadata - Time and Job ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{timeAgo}</span>
                </div>
                <span className="text-xs text-gray-500">{job.jobId}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


