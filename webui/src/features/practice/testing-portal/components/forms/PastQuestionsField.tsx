// src/features/practice/testing-portal/components/forms/PastQuestionsField.tsx
/**
 * Collapsible "Past Questions" field. Stays folded by default to keep the
 * generator forms short, with a live count badge so users can tell at a
 * glance whether previously generated questions are being fed back in.
 */
"use client";

import { useState } from "react";
import { useWatch, type Control, type FieldValues, type Path, type UseFormRegisterReturn } from "react-hook-form";
import { ChevronDown, History } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TextareaField } from "@/features/learning/explainer/components/fields";
import { cn } from "@/lib/utils";
import { splitPastQuestions } from "../../lib/pastQuestions";

interface PastQuestionsFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  /** Spread of `form.register(name)` — TextareaField consumes it like the plain fields. */
  registration: UseFormRegisterReturn;
  htmlFor: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function PastQuestionsField<TFieldValues extends FieldValues>({
  name,
  control,
  registration,
  htmlFor,
  placeholder = "One question per line — previously generated questions to avoid repetition.",
  error,
  disabled,
}: PastQuestionsFieldProps<TFieldValues>) {
  const [open, setOpen] = useState(false);
  const value = useWatch({ control, name });
  const count = splitPastQuestions(value ?? "").length;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-border/60 bg-muted/30">
      <CollapsibleTrigger
        type="button"
        disabled={disabled}
        aria-invalid={!!error}
        className={cn(
          "group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors",
          "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          disabled && "cursor-not-allowed opacity-60 hover:bg-transparent"
        )}
      >
        <History className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium">Past Questions</span>
        {count > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
            {count}
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{open ? "" : "optional"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3">
          <TextareaField
            label="Previously generated questions"
            htmlFor={htmlFor}
            placeholder={placeholder}
            disabled={disabled}
            hint="One question per line — the generator avoids repeating these."
            error={error}
            {...registration}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
