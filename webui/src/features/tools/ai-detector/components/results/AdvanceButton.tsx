// src/features/tools/ai-detector/components/results/AdvanceButton.tsx
/**
 * Button-driven step advancement for result cards. Every wizard transition
 * happens through this explicit click, with a spinner while a request runs.
 */
"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdvanceButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  isPending?: boolean;
  pendingLabel?: string;
  variant?: "default" | "outline" | "ghost";
  children: React.ReactNode;
}

export function AdvanceButton({
  icon: Icon,
  onClick,
  isPending = false,
  pendingLabel,
  variant = "default",
  children,
}: AdvanceButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      variant={variant}
      onClick={onClick}
      disabled={isPending}
      className="w-full gap-2 sm:w-auto"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel ?? "Working…"}
        </>
      ) : (
        <>
          <Icon className="h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
}
