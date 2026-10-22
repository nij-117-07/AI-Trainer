// src/features/tools/vision-converter/components/pages/VisionConverterPage.tsx
/**
 * Vision Converter tool page. Image picker + instruction wired to the
 * convert Server Action with loading/error UX and persisted drafts.
 */
"use client";

import { useState, type FormEvent } from "react";
import { FileImage } from "lucide-react";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField } from "@/features/learning/explainer/components/fields";
import { FileUploadField } from "../../../components/FileUploadField";
import { convertImageAction } from "../../actions/convert";
import { VisionConverterResult } from "../results/VisionConverterResult";
import type {
  VisionConversionResponse,
  VisionConvertPayload,
} from "../../types";

const STORAGE_KEY = "tools.vision-converter.v1";
const DEFAULT_INSTRUCTION = "Convert the image to markdown.";

export function VisionConverterPage() {
  const instruction = usePersistedState<string>({
    key: `${STORAGE_KEY}.instruction`,
    initialValue: DEFAULT_INSTRUCTION,
  });
  const resultState = usePersistedState<VisionConversionResponse | null>({
    key: `${STORAGE_KEY}.result`,
    initialValue: null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const tool = useToolRequest<VisionConvertPayload, VisionConversionResponse>({
    run: ({ file: uploadFile, instruction: uploadInstruction }) =>
      convertImageAction(uploadFile, uploadInstruction),
    onSuccess: resultState.setValue,
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setFileError("Choose an image to convert first.");
      return;
    }
    setFileError(null);
    tool.execute({ file, instruction: instruction.value });
  };

  const reset = () => {
    instruction.setValue(DEFAULT_INSTRUCTION);
    resultState.clear();
    setFile(null);
    setFileError(null);
  };

  const result = tool.data ?? resultState.value;

  return (
    <ExplainerPageShell
      title="Vision Converter"
      description="Upload an image — a chart, report, whiteboard, or screenshot — and get clean, well-structured Markdown."
      headerAction={
        <DraftStatus
          status={instruction.status}
          onReset={reset}
          onClear={reset}
          disabled={tool.isPending}
        />
      }
      form={
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUploadField
            label="Image"
            htmlFor="vision_file"
            value={file}
            onChange={(next) => {
              setFile(next);
              if (next) setFileError(null);
            }}
            error={fileError ?? undefined}
            hint="PNG, JPG, or WEBP. Compressed automatically if larger than 1MB."
            disabled={tool.isPending}
          />
          <InputField
            label="Instruction (optional)"
            htmlFor="instruction"
            placeholder="e.g. Extract all tables and headings."
            value={instruction.value}
            onChange={(event) => instruction.setValue(event.target.value)}
            disabled={tool.isPending}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Convert to Markdown"
            submitPendingLabel="Converting image…"
          />
        </form>
      }
      result={
        result ? (
          <VisionConverterResult result={result} />
        ) : (
          <EmptyResult
            icon={FileImage}
            title="No conversion yet"
            description="Upload an image and the AI will convert it into structured Markdown."
          />
        )
      }
    />
  );
}
