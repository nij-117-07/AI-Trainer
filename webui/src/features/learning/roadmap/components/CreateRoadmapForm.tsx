// src/features/learning/roadmap/components/CreateRoadmapForm.tsx
/**
 * "Create Roadmap" dialog. Step 1 collects the topic + level fields and can
 * AI-generate the main points; step 2 lets the user tweak the main-point list
 * (remove / add manually) before creating the roadmap.
 *
 * The whole draft (form values + last generated topics) is persisted to
 * localStorage so a refresh mid-flow doesn't lose progress.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { z } from "zod";
import {
  RoadmapRequestSchema,
  RoadmapResponse,
} from "../types";
import { generateRoadmapAction } from "../actions/generate";
import { createRoadmapAction } from "../actions/crud";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { AddPointForm } from "./AddPointForm";
import {
  roadmapLevelOptions,
  roadmapModeOptions,
  roadmapPersonaStyleOptions,
} from "../lib/options";

type CreateFormValues = z.infer<typeof RoadmapRequestSchema>;

const STORAGE_KEY = "learning.roadmap.create.v1";

const DEFAULTS: CreateFormValues = {
  subject: "",
  start_level: "Beginner",
  target_level: "Professional",
  mode: "detailed",
  persona_style: "industry expert",
  user_instructions: "",
};

interface CreateRoadmapFormProps {
  onCreated?: (roadmapId: string) => void;
}

export function CreateRoadmapForm({ onCreated }: CreateRoadmapFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const persisted = usePersistedForm<CreateFormValues, RoadmapResponse>({
    schema: RoadmapRequestSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });

  const generate = useToolRequest<CreateFormValues, RoadmapResponse>({
    run: generateRoadmapAction,
    onSuccess: (result) => persisted.setResult(result),
  });

  const [isCreating, startCreate] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);

  const errors = persisted.form.formState.errors;
  const topics = persisted.result?.main_topics ?? [];
  const persona = persisted.result?.generated_persona_prompt ?? "";

  const setTopics = (next: string[]) => {
    persisted.setResult({ generated_persona_prompt: persona, main_topics: next });
  };

  const handleCreate = async (values: CreateFormValues) => {
    setCreateError(null);
    startCreate(async () => {
      try {
        const created = await createRoadmapAction({
          ...values,
          persona,
          main_topics: topics,
        });
        persisted.clearDraft();
        setOpen(false);
        onCreated?.(created.id);
        router.push(`/learning/roadmap/${created.id}`);
        router.refresh();
      } catch (error) {
        setCreateError(
          error instanceof Error ? error.message : "Failed to create the roadmap."
        );
      }
    });
  };

  const disabled = generate.isPending || isCreating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <span className="text-lg leading-none">+</span>
          Create Roadmap
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a Learning Roadmap</DialogTitle>
          <DialogDescription>
            Describe what you want to learn. Generate the main points with AI, or
            skip straight to adding them yourself.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={persisted.form.handleSubmit(generate.execute)}
          className="space-y-4"
        >
          <InputField
            label="Subject"
            htmlFor="subject"
            placeholder="e.g. UI/UX Design"
            disabled={disabled}
            {...persisted.form.register("subject")}
            error={errors.subject?.message}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Start Level"
              name="start_level"
              htmlFor="start_level"
              control={persisted.form.control}
              options={roadmapLevelOptions}
              disabled={disabled}
              error={errors.start_level?.message}
            />
            <SelectField
              label="Target Level"
              name="target_level"
              htmlFor="target_level"
              control={persisted.form.control}
              options={roadmapLevelOptions}
              disabled={disabled}
              error={errors.target_level?.message}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Mode"
              name="mode"
              htmlFor="mode"
              control={persisted.form.control}
              options={roadmapModeOptions}
              disabled={disabled}
              error={errors.mode?.message}
            />
            <SelectField
              label="Persona Style"
              name="persona_style"
              htmlFor="persona_style"
              control={persisted.form.control}
              options={roadmapPersonaStyleOptions}
              disabled={disabled}
              error={errors.persona_style?.message}
            />
          </div>
          <TextareaField
            label="Instructions (optional)"
            htmlFor="user_instructions"
            placeholder="e.g. Add more focus on Figma prototyping"
            disabled={disabled}
            {...persisted.form.register("user_instructions")}
            error={errors.user_instructions?.message}
          />
          <FormActions
            isPending={generate.isPending}
            error={generate.error}
            submitLabel="Generate Main Points"
            submitPendingLabel="Generating…"
          />
        </form>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Main Points</h4>
            {topics.length > 0 && (
              <span className="text-xs text-muted-foreground">{topics.length} topics</span>
            )}
          </div>

          {topics.length === 0 ? (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              No main points yet. Generate them above, or add one manually below.
            </p>
          ) : (
            <ol className="space-y-1.5">
              {topics.map((topic, index) => (
                <li
                  key={`${topic}-${index}`}
                  className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">{topic}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled}
                    aria-label={`Remove ${topic}`}
                    onClick={() => setTopics(topics.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ol>
          )}

          <AddPointForm
            placeholder="Add a main point manually…"
            disabled={disabled}
            onSubmit={(title) => setTopics([...topics, title])}
          />

          {createError && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {createError}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full gap-2"
            disabled={disabled}
            onClick={() => persisted.form.handleSubmit(handleCreate)()}
          >
            {isCreating ? "Creating…" : "Create Roadmap"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
