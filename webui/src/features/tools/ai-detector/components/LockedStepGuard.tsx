// src/features/tools/ai-detector/components/LockedStepGuard.tsx
/**
 * Guard shown when a later wizard step is reached without its prerequisite
 * result (e.g. a stale draft). Explains what is missing and offers a button
 * back to the Detect step instead of rendering an empty form.
 */
"use client";

import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LockedStepGuardProps {
  title: string;
  description: string;
  onBack: () => void;
}

export function LockedStepGuard({ title, description, onBack }: LockedStepGuardProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <LockKeyhole className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        <Button type="button" variant="outline" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Detect
        </Button>
      </CardContent>
    </Card>
  );
}
