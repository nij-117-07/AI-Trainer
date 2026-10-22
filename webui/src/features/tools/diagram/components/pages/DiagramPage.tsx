// src/features/tools/diagram/components/pages/DiagramPage.tsx
/**
 * Diagram Generator tool page. Persisted form wired to the generate Server
 * Action. Generated code feeds back into "Existing Code" (with a localStorage
 * version history) so each run refines the last output, and Mermaid code gets
 * a live pan/zoom/download preview.
 */
"use client";

import { useState } from "react";
import { useWatch } from "react-hook-form";
import type { z } from "zod";
import { GitBranch } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { TextareaField } from "@/features/learning/explainer/components/fields";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiagramFormSchema, type DiagramFormat, type DiagramResponse } from "../../types";
import { generateDiagramAction } from "../../actions/generate";
import { useDiagramHistory } from "../../lib/history";
import { DiagramResult } from "../results/DiagramResult";

const STORAGE_KEY = "tools.diagram.generate.v2";

type DiagramFormValues = z.infer<typeof DiagramFormSchema>;

const DEFAULTS: DiagramFormValues = {
  format: "mermaid" as DiagramFormat,
  instruction: "Flowchart of the login flow",
  context:
    "User enters credentials, the system validates them, then routes to dashboard or shows an error.",
  existing_mermaid: "",
  existing_drawio: "",
};

function formatLabel(format: string) {
  return format === "mermaid" ? "Mermaid" : "Draw.io";
}

function codeSnippet(code: string) {
  const firstLine = code.split("\n").find((line) => line.trim()) ?? "";
  const trimmed = firstLine.trim();
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

export function DiagramPage() {
  const persisted = usePersistedForm<DiagramFormValues, DiagramResponse>({
    schema: DiagramFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const { versions, addVersion } = useDiagramHistory();

  const tool = useToolRequest<DiagramFormValues, DiagramResponse>({
    run: generateDiagramAction,
    onSuccess: (data) => {
      persisted.setResult(data);
      if (data.format === "mermaid") {
        persisted.form.setValue("existing_mermaid", data.code, { shouldDirty: true });
      } else {
        persisted.form.setValue("existing_drawio", data.code, { shouldDirty: true });
      }
      addVersion(data.code, data.format);
    },
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  const format = useWatch({ control: persisted.form.control, name: "format" }) ?? "mermaid";
  const isMermaid = format === "mermaid";
  const formatVersions = versions.filter((version) => version.format === format);

  const resultFormat = result?.format ?? "";
  const resultKey = `${resultFormat}::${result?.code ?? ""}`;
  const [lastResultKey, setLastResultKey] = useState(resultKey);
  const [previewMermaid, setPreviewMermaid] = useState("");
  const [previewDrawio, setPreviewDrawio] = useState("");
  const [editorVersion, setEditorVersion] = useState(0);
  if (resultKey !== lastResultKey) {
    setLastResultKey(resultKey);
    if (resultFormat === "mermaid") {
      setPreviewMermaid(result?.code ?? "");
    } else if (resultFormat === "drawio") {
      setPreviewDrawio(result?.code ?? "");
      setEditorVersion((version) => version + 1);
    }
  }

  const previewCode = isMermaid ? previewMermaid : previewDrawio;

  const handleRender = () => {
    const customCode = persisted.form.getValues("existing_mermaid");
    if (customCode.trim()) setPreviewMermaid(customCode);
  };

  const handleDrawioSave = (savedXml: string) => {
    if (!savedXml.trim()) return;
    if (savedXml === previewDrawio) return;
    persisted.form.setValue("existing_drawio", savedXml, { shouldDirty: true });
    setPreviewDrawio(savedXml);
    addVersion(savedXml, "drawio");
  };

  const handleDrawioReload = () => {
    const savedXml = persisted.form.getValues("existing_drawio");
    if (savedXml.trim()) setPreviewDrawio(savedXml);
    setEditorVersion((version) => version + 1);
  };

  const handleRestore = (savedAt: string) => {
    const version = versions.find((entry) => entry.savedAt === savedAt);
    if (!version) return;
    if (version.format === "mermaid") {
      persisted.form.setValue("existing_mermaid", version.code, { shouldDirty: true });
      setPreviewMermaid(version.code);
    } else {
      persisted.form.setValue("existing_drawio", version.code, { shouldDirty: true });
      setPreviewDrawio(version.code);
    }
  };

  return (
    <ExplainerPageShell
      title="Diagram Generator"
      description="Generate or refine Mermaid / Draw.io diagram code from a natural-language instruction."
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
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Format</Label>
            <Tabs
              value={format}
              onValueChange={(value) =>
                persisted.form.setValue("format", value as DiagramFormat, { shouldDirty: true })
              }
            >
              <TabsList className="w-full">
                <TabsTrigger value="mermaid" className="flex-1" disabled={tool.isPending}>
                  Mermaid
                </TabsTrigger>
                <TabsTrigger value="drawio" className="flex-1" disabled={tool.isPending}>
                  Draw.io
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <TextareaField
            label="Instruction"
            htmlFor="instruction"
            placeholder="e.g. Flowchart of the login flow"
            disabled={tool.isPending}
            {...persisted.form.register("instruction")}
            error={errors.instruction?.message}
          />
          <TextareaField
            label="Context (optional)"
            htmlFor="context"
            placeholder="Business logic or technical context…"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <div className={isMermaid ? "" : "hidden"}>
            <TextareaField
              label="Existing Mermaid Code (optional)"
              htmlFor="existing_mermaid"
              placeholder="Paste existing Mermaid code to refine it…"
              className="min-h-32"
              disabled={tool.isPending}
              {...persisted.form.register("existing_mermaid")}
              error={errors.existing_mermaid?.message}
              hint="Generated Mermaid code is fed back here, so each run refines the previous result."
            />
          </div>
          <div className={isMermaid ? "hidden" : ""}>
            <TextareaField
              label="Existing Draw.io Code (optional)"
              htmlFor="existing_drawio"
              placeholder="Paste existing Draw.io XML to refine it…"
              className="min-h-32"
              disabled={tool.isPending}
              {...persisted.form.register("existing_drawio")}
              error={errors.existing_drawio?.message}
              hint="Generated Draw.io code is fed back here, so each run refines the previous result."
            />
          </div>
          {formatVersions.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Restore a previous {formatLabel(format)} version
              </Label>
              <Select onValueChange={handleRestore} disabled={tool.isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a past version…" />
                </SelectTrigger>
                <SelectContent>
                  {formatVersions.map((version) => (
                    <SelectItem key={version.savedAt} value={version.savedAt}>
                      {formatLabel(version.format)} ·{" "}
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
            submitLabel="Generate Diagram"
            submitPendingLabel="Drawing…"
          />
        </form>
      }
      result={
        result ? (
          <DiagramResult
            result={result}
            previewCode={previewCode}
            isMermaid={isMermaid}
            onRender={handleRender}
            onDrawioSave={handleDrawioSave}
            onDrawioReload={handleDrawioReload}
            editorVersion={editorVersion}
          />
        ) : (
          <EmptyResult
            icon={GitBranch}
            title="No diagram yet"
            description="Describe a diagram and pick a format to generate its code."
          />
        )
      }
    />
  );
}
