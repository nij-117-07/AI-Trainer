"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthenticatedError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Authenticated layout error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          An unexpected error occurred. Please try again, or contact support if the problem persists.
        </p>
      </div>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  );
}
