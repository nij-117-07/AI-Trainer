// src/features/learning/roadmap/components/ProgressBar.tsx
/**
 * Compact progress bar with a "x/y done" label, used on the roadmap list
 * cards and the detail header.
 */
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  done: number;
  total: number;
  percent: number;
  className?: string;
}

export function ProgressBar({ done, total, percent, className }: ProgressBarProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {done} / {total} done
        </span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
