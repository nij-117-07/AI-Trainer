import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Page } from "../types/page";

interface PageCardProps {
  page: Page;
  onVisit?: (page: Page) => void;
}

export function PageCard({ page, onVisit }: PageCardProps) {
  return (
    <Link
      href={page.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
      aria-label={`Navigate to ${page.title}`}
      onClick={() => onVisit?.(page)}
    >
      <div className="h-full rounded-lg border border-slate-200 bg-white p-3 transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 leading-4">
            {page.category}
          </Badge>
          {page.tags.length > 0 && (
            <span className="text-[10px] text-slate-400 shrink-0">
              #{page.tags[0]}
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">
          {page.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-1 mt-0.5">
          {page.description}
        </p>
      </div>
    </Link>
  );
}
