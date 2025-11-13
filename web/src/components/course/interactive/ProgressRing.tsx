/**
 * Progress Ring Component
 * Circular progress indicator with percentage display
 */

'use client';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  color = 'hsl(var(--primary))',
  backgroundColor = 'hsl(var(--muted))',
  className = '',
}: ProgressRingProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Calculate circle properties
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>

      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}
