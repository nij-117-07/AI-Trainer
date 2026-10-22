// src/features/tools/ingredients/components/pages/IngredientsPage.tsx
/**
 * Ingredients Checker tool page. Photo + optional manual text wired to the
 * check Server Action with loading/error UX and persisted drafts.
 */
"use client";

import { useState, type FormEvent } from "react";
import { Apple } from "lucide-react";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { TextareaField } from "@/features/learning/explainer/components/fields";
import { FileUploadField } from "../../../components/FileUploadField";
import { checkIngredientsAction } from "../../actions/check";
import { IngredientsResult } from "../results/IngredientsResult";
import type {
  IngredientAnalysisResponse,
  IngredientCheckPayload,
} from "../../types";

const STORAGE_KEY = "tools.ingredients.v1";
const DEFAULT_MANUAL_TEXT = "";

export function IngredientsPage() {
  const manualText = usePersistedState<string>({
    key: `${STORAGE_KEY}.manual_text`,
    initialValue: DEFAULT_MANUAL_TEXT,
  });
  const resultState = usePersistedState<IngredientAnalysisResponse | null>({
    key: `${STORAGE_KEY}.result`,
    initialValue: null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const tool = useToolRequest<IngredientCheckPayload, IngredientAnalysisResponse>({
    run: ({ file: uploadFile, manual_text: manualTextValue }) =>
      checkIngredientsAction(uploadFile, manualTextValue),
    onSuccess: resultState.setValue,
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setFileError("Choose an ingredients photo to analyze.");
      return;
    }
    setFileError(null);
    tool.execute({ file, manual_text: manualText.value });
  };

  const reset = () => {
    manualText.setValue(DEFAULT_MANUAL_TEXT);
    resultState.clear();
    setFile(null);
    setFileError(null);
  };

  const result = tool.data ?? resultState.value;

  return (
    <ExplainerPageShell
      title="Ingredients Checker"
      description="Upload a photo of a product's ingredients list and get a clear 1–5 health score with the reasons behind it."
      headerAction={
        <DraftStatus
          status={manualText.status}
          onReset={reset}
          onClear={reset}
          disabled={tool.isPending}
        />
      }
      form={
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUploadField
            label="Ingredients photo"
            htmlFor="ingredients_file"
            value={file}
            onChange={(next) => {
              setFile(next);
              if (next) setFileError(null);
            }}
            error={fileError ?? undefined}
            hint="PNG, JPG, or WEBP. Compressed automatically if larger than 1MB."
            disabled={tool.isPending}
          />
          <TextareaField
            label="Manual text (optional)"
            htmlFor="manual_text"
            placeholder="e.g. water, sugar, citric acid"
            value={manualText.value}
            onChange={(event) => manualText.setValue(event.target.value)}
            disabled={tool.isPending}
            hint="Paste the ingredient list if the photo is blurry."
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Analyze Ingredients"
            submitPendingLabel="Reading label…"
          />
        </form>
      }
      result={
        result ? (
          <IngredientsResult result={result} />
        ) : (
          <EmptyResult
            icon={Apple}
            title="No analysis yet"
            description="Upload a photo or paste the ingredients to get a health score."
          />
        )
      }
    />
  );
}
