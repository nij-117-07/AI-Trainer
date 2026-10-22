// src/features/learning/components/ExplainerToolsGrid.tsx
/**
 * Responsive card grid of all Explainer tools, driven by the shared tool
 * registry. Used by both the Learning Hub and the Explainer overview pages.
 */
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { explainerTools, type ExplainerTool } from "@/features/learning/lib/explainer-tools";

export function ExplainerToolsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {explainerTools.map((tool) => (
        <ExplainerToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

function ExplainerToolCard({ tool }: { tool: ExplainerTool }) {
  const Icon = tool.icon;
  return (
    <Link href={tool.href} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:ring-primary/40">
        <CardContent className="flex h-full flex-col gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg bg-gradient-to-br",
              tool.accent
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{tool.title}</h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
            Open tool
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
