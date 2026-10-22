// src/features/learning/explainer/components/EmptyResult.tsx
/**
 * Reusable empty state for the result panel before a tool has produced output.
 */
"use client";

import type { LucideIcon } from "lucide-react";
import { Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyResultProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export function EmptyResult({
  icon: Icon = Wand2,
  title = "No output yet",
  description = "Fill in the form and generate to see the result here.",
}: EmptyResultProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
