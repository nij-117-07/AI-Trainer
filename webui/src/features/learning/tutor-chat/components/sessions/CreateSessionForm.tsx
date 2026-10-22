// src/features/learning/tutor-chat/components/sessions/CreateSessionForm.tsx
/**
 * Inline "start a new tutoring session" form on the picker screen. Collects
 * the master topic and optional additional context, then creates a session on
 * the server and hands the new session id to the parent to open.
 */
"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import { CreateSessionInputSchema, type CreateSessionInput } from "../../types";
import { createSessionAction } from "../../actions/sessions";

interface CreateSessionFormProps {
  onCreated: (sessionId: string) => void;
  disabled?: boolean;
}

export function CreateSessionForm({ onCreated, disabled }: CreateSessionFormProps) {
  const [form, setForm] = useState<CreateSessionInput>({ master_topic: "", additional_context: "" });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const parsed = CreateSessionInputSchema.safeParse(form);
    if (!parsed.success) {
      setFieldError(parsed.error.issues.map((issue) => issue.message).join(", "));
      return;
    }
    setFieldError(null);
    setActionError(null);
    startTransition(async () => {
      try {
        const created = await createSessionAction(parsed.data);
        setForm({ master_topic: "", additional_context: "" });
        onCreated(created.id);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Failed to create the session."
        );
      }
    });
  };

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Start a new tutoring session</h2>
        </div>

        <InputField
          label="Master Topic"
          htmlFor="master_topic"
          placeholder="e.g. Quantum Physics"
          value={form.master_topic}
          onChange={(event) =>
            setForm((current) => ({ ...current, master_topic: event.target.value }))
          }
          error={fieldError ?? undefined}
          disabled={disabled || isPending}
        />
        <TextareaField
          label="Your Background & Context"
          htmlFor="additional_context"
          placeholder="Optional — background, goals, or learning style…"
          hint="You can edit this later from inside the chat."
          value={form.additional_context}
          onChange={(event) =>
            setForm((current) => ({ ...current, additional_context: event.target.value }))
          }
          disabled={disabled || isPending}
        />

        {actionError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <Button
          type="button"
          className="w-full gap-2"
          disabled={disabled || isPending}
          onClick={handleSubmit}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>Start Chatting</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
