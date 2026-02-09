import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = true, ...props }, ref) => {
    // Ensure value is a number and clamp it
    const numValue = typeof value === 'number' ? value : 0;
    const percentage = Math.round((numValue / max) * 100);
    // Clamp percentage between 0 and 100
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    
    console.log('Progress component render:', { 
      value, 
      numValue,
      max, 
      percentage, 
      clampedPercentage,
      finalWidth: `${clampedPercentage}%`
    });
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-8 w-full overflow-hidden rounded-lg bg-gray-200",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 transition-all flex items-center justify-center"
          style={{ 
            width: `${clampedPercentage}%`,
            background: 'linear-gradient(90deg, #0D0D0D, #1a1a1a)'
          }}
        >
          {showLabel && (
            <span className="text-white font-semibold text-sm">
              {clampedPercentage}%
            </span>
          )}
        </div>
      </div>
    );
  }
)
Progress.displayName = "Progress"

export { Progress }