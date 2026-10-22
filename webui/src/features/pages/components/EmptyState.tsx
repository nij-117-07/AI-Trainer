// src/features/pages/components/EmptyState.tsx
/**
 * Empty state display when no pages match search criteria.
 * Provides clear feedback and a reset action to recover from zero-results state.
 */

import { FileSearch, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 mt-8">
      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <FileSearch className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        No pages found
      </h3>
      <p className="text-slate-500 max-w-md mb-6 leading-relaxed">
        We couldn't find any pages matching your current filters. Try adjusting your search terms or category selection.
      </p>
      <Button 
        onClick={onReset}
        variant="outline"
        className="gap-2 border-slate-300 hover:bg-slate-50"
      >
        <RefreshCcw className="h-4 w-4" />
        Clear All Filters
      </Button>
    </div>
  );
}