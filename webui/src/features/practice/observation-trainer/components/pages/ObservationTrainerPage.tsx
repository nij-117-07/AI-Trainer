// src/features/practice/observation-trainer/components/pages/ObservationTrainerPage.tsx
/**
 * Observation Trainer page: upload an image, report what you observe, and get
 * a scored evaluation plus the details you missed.
 */
"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { FileUploadField } from "@/features/tools/components/FileUploadField";
import { trainObservationAction } from "../../actions/train";
import { TrainFormSchema, type TrainFormValues, type TrainResponse } from "../../types";
import { ObservationTrainerResult } from "../results/ObservationTrainerResult";

const STORAGE_KEY = "practice.observation-trainer.form.v1";

const DEFAULTS: TrainFormValues = {
  training_scenario: "Crime scene investigation",
  user_observations: "",
  context_category: "",
  training_focus: "",
  reveal_hidden: true,
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

export function ObservationTrainerPage() {
  const persisted = usePersistedForm<TrainFormValues, TrainResponse>({
    schema: TrainFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const tool = useToolRequest<{ values: TrainFormValues; image: string }, TrainResponse>({
    run: async ({ values, image }) => {
      const payload = {
        image,
        user_observations: values.user_observations.trim(),
        training_scenario: values.training_scenario.trim(),
        reveal_hidden: values.reveal_hidden,
        context_category: values.context_category.trim() || undefined,
        training_focus: values.training_focus.trim() || undefined,
      };
      return trainObservationAction(payload);
    },
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  const reset = () => {
    persisted.resetDraft();
    setFile(null);
    setFileError(null);
  };

  return (
    <ExplainerPageShell
      title="Observation Trainer"
      description="Upload an image, report what you notice in it, and get scored on accuracy and relevance — plus the subtle details you likely missed."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={reset}
          onClear={reset}
          disabled={tool.isPending}
        />
      }
      form={
        <form
          onSubmit={persisted.form.handleSubmit(async (values) => {
            if (!file) {
              setFileError("Choose an image to observe.");
              return;
            }
            setFileError(null);
            const image = await fileToDataUrl(file);
            tool.execute({ values, image });
          })}
          className="space-y-4"
        >
          <FileUploadField
            label="Image to Observe"
            htmlFor="obs_image"
            value={file}
            onChange={(next) => {
              setFile(next);
              if (next) setFileError(null);
            }}
            error={fileError ?? undefined}
            hint="PNG, JPG, or WEBP — a photograph, diagram, or scan."
            disabled={tool.isPending}
          />
          <InputField
            label="Training Scenario"
            htmlFor="obs_scenario"
            placeholder="e.g. Crime scene investigation"
            disabled={tool.isPending}
            {...persisted.form.register("training_scenario")}
            error={errors.training_scenario?.message}
          />
          <TextareaField
            label="What did you observe?"
            htmlFor="obs_observations"
            placeholder="Describe every detail you noticed in the image."
            disabled={tool.isPending}
            {...persisted.form.register("user_observations")}
            error={errors.user_observations?.message}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Context Category (optional)"
              htmlFor="obs_category"
              placeholder="e.g. portrait, x-ray, landscape"
              disabled={tool.isPending}
              {...persisted.form.register("context_category")}
              error={errors.context_category?.message}
            />
            <InputField
              label="Training Focus (optional)"
              htmlFor="obs_focus"
              placeholder="e.g. body language, lighting, text"
              disabled={tool.isPending}
              {...persisted.form.register("training_focus")}
              error={errors.training_focus?.message}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="obs_reveal"
              checked={persisted.form.watch("reveal_hidden")}
              disabled={tool.isPending}
              onCheckedChange={(checked) =>
                persisted.form.setValue("reveal_hidden", checked === true, { shouldDirty: true })
              }
            />
            <Label htmlFor="obs_reveal" className="text-sm font-medium">
              Reveal details I missed
            </Label>
          </div>
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Train my observation"
            submitPendingLabel="Analyzing the image…"
          />
        </form>
      }
      result={
        result ? (
          <ObservationTrainerResult result={result} />
        ) : (
          <EmptyResult
            icon={Eye}
            title="No training yet"
            description="Upload an image, describe what you see, and the trainer will score your observation skills."
          />
        )
      }
    />
  );
}
