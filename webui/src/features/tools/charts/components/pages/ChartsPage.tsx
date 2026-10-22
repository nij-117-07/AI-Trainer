// src/features/tools/charts/components/pages/ChartsPage.tsx
/**
 * Chart.js Generator tool page. Persisted form wired to the generate Server
 * Action. Generated code feeds back into "Previous Code" (with a localStorage
 * version history) so each run refines the last output, and the chart gets a
 * live pan/zoom/download/copy preview.
 */
"use client";

import { useState } from "react";
import type { z } from "zod";
import { BarChart3 } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { TextareaField } from "@/features/learning/explainer/components/fields";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartsFormSchema, type ChartResponse } from "../../types";
import { generateChartAction } from "../../actions/generate";
import { useChartHistory } from "../../lib/history";
import { ChartsResult } from "../results/ChartsResult";

type ChartsFormValues = z.infer<typeof ChartsFormSchema>;

const STORAGE_KEY = "tools.charts.generate.v1";

const DEFAULTS: ChartsFormValues = {
  data_input:
    "[{ label: 'Jan', value: 12 }, { label: 'Feb', value: 19 }, { label: 'Mar', value: 3 }]",
  custom_instructions: "Bar chart, blue bars, dark theme, rounded corners.",
  previous_code: "",
};

function codeSnippet(code: string) {
  const firstLine = code.split("\n").find((line) => line.trim()) ?? "";
  const trimmed = firstLine.trim();
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

export function ChartsPage() {
  const persisted = usePersistedForm<ChartsFormValues, ChartResponse>({
    schema: ChartsFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const { versions, addVersion } = useChartHistory();

  const tool = useToolRequest<ChartsFormValues, ChartResponse>({
    run: generateChartAction,
    onSuccess: (data) => {
      persisted.setResult(data);
      persisted.form.setValue("previous_code", data.chart_div_code, { shouldDirty: true });
      addVersion(data.chart_div_code);
    },
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  const resultCode = result?.chart_div_code ?? "";
  const [lastResultCode, setLastResultCode] = useState(resultCode);
  const [previewCode, setPreviewCode] = useState(resultCode);
  if (resultCode !== lastResultCode) {
    setLastResultCode(resultCode);
    setPreviewCode(resultCode);
  }

  const handleRender = () => {
    const customCode = persisted.form.getValues("previous_code");
    if (customCode.trim()) setPreviewCode(customCode);
  };

  const handleRestore = (savedAt: string) => {
    const version = versions.find((entry) => entry.savedAt === savedAt);
    if (!version) return;
    persisted.form.setValue("previous_code", version.code, { shouldDirty: true });
    setPreviewCode(version.code);
  };

  return (
    <ExplainerPageShell
      title="Chart.js Generator"
      description="Generate a Chart.js HTML/JS visualization from raw data and your style preferences."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={persisted.resetDraft}
          onClear={persisted.clearDraft}
          disabled={tool.isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
          <TextareaField
            label="Data Input"
            htmlFor="data_input"
            placeholder="JSON, CSV, or plain text…"
            className="min-h-32"
            disabled={tool.isPending}
            {...persisted.form.register("data_input")}
            error={errors.data_input?.message}
          />
          <TextareaField
            label="Custom Instructions"
            htmlFor="custom_instructions"
            placeholder="Chart type, colors, labels, theme…"
            disabled={tool.isPending}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <TextareaField
            label="Previous Code (optional)"
            htmlFor="previous_code"
            placeholder="Existing Chart.js code to refactor…"
            className="min-h-32"
            disabled={tool.isPending}
            {...persisted.form.register("previous_code")}
            error={errors.previous_code?.message}
            hint="Generated code is fed back here, so each run refines the previous result."
          />
          {versions.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Restore a previous version</Label>
              <Select onValueChange={handleRestore} disabled={tool.isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a past version…" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.savedAt} value={version.savedAt}>
                      {new Date(version.savedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" — "}
                      {codeSnippet(version.code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Chart"
            submitPendingLabel="Plotting…"
          />
        </form>
      }
      result={
        result ? (
          <ChartsResult result={result} previewCode={previewCode} onRender={handleRender} />
        ) : (
          <EmptyResult
            icon={BarChart3}
            title="No chart yet"
            description="Paste some data and describe the chart you want."
          />
        )
      }
    />
  );
}
