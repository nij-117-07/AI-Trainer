// src/features/learning/components/LearningHubCard.tsx
/**
 * Single-app link card used by the Learning Hub for apps that open straight
 * into a tool (Roadmap, Memory Helper, Project Recommender).
 */
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LearningHubCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Gradient + text-color classes for the icon tile. */
  accent?: string;
}

export function LearningHubCard({
  href,
  title,
  description,
  icon: Icon,
  accent = "bg-primary/10 text-primary",
}: LearningHubCardProps) {
  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="transition-all group-hover:-translate-y-0.5 group-hover:ring-primary/40">
        <CardContent className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
              accent
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
            Open
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
