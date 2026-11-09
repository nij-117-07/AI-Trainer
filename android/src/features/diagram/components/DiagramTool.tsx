// src/features/diagram/components/DiagramTool.tsx
/** Diagram Generator screen body: the instruction form, the generated diagram, and version restore. */
import { useEffect, useRef, useState } from "react";
import { RefreshCcw, Sparkles, X } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Field, Panel, TextField, ChoiceChips } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { usePersistedDiagram } from "../hooks/usePersistedDiagram";
import { useDiagramHistory } from "../hooks/useDiagramHistory";
import { generateDiagram } from "../lib/generators";
import { CONTEXT_MAX, DIAGRAM_FORMAT_OPTIONS, EXISTING_CODE_MAX, INSTRUCTION_MAX } from "../options";
import type { DiagramFormat, DiagramFormValues, DiagramResult, DiagramVersion } from "../types";
import { DiagramResultPanel } from "./DiagramResultPanel";
import { VersionList } from "./VersionList";

const FEEDBACK_HINT = "Generated code is fed back here, so each run refines the previous result.";

function withCode(form: DiagramFormValues, format: DiagramFormat, code: string): DiagramFormValues {
  return format === "mermaid" ? { ...form, existingMermaid: code } : { ...form, existingDrawio: code };
}

export function DiagramTool() {
  const { settings } = useAiSettings();
  const { draft, setDraft, reset } = usePersistedDiagram();
  const { versions, addVersion } = useDiagramHistory();
  const request = useRequest(generateDiagram);
  const [editorVersion, setEditorVersion] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const { form, result, previewMermaid, previewDrawio } = draft;
  const isMermaid = form.format === "mermaid";
  const previewCode = isMermaid ? previewMermaid : previewDrawio;

  function updateForm<K extends keyof DiagramFormValues>(key: K, value: DiagramFormValues[K]) {
    setDraft((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));
  }

  async function handleGenerate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
    if (!next) return;
    applyGenerated(next);
    addVersion(next.code, next.format);
  }

  function applyGenerated(next: DiagramResult) {
    setDraft((prev) => ({
      ...prev,
      form: withCode(prev.form, next.format, next.code),
      result: next,
      previewMermaid: next.format === "mermaid" ? next.code : prev.previewMermaid,
      previewDrawio: next.format === "drawio" ? next.code : prev.previewDrawio,
    }));
    if (next.format === "drawio") setEditorVersion((version) => version + 1);
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  function handleReset() {
    reset();
    request.reset();
  }

  function handleRender() {
    const code = form.existingMermaid.trim();
    if (code) setDraft((prev) => ({ ...prev, previewMermaid: code }));
  }

  function handleDrawioSave(xml: string) {
    if (!xml.trim() || xml === previewDrawio) return;
    setDraft((prev) => ({ ...prev, form: { ...prev.form, existingDrawio: xml }, previewDrawio: xml }));
    addVersion(xml, "drawio");
  }

  function handleDrawioReload() {
    const saved = form.existingDrawio;
    if (saved.trim()) setDraft((prev) => ({ ...prev, previewDrawio: saved }));
    setEditorVersion((version) => version + 1);
  }

  function handleRestore(version: DiagramVersion) {
    setDraft((prev) => ({
      ...prev,
      form: withCode(prev.form, version.format, version.code),
      previewMermaid: version.format === "mermaid" ? version.code : prev.previewMermaid,
      previewDrawio: version.format === "drawio" ? version.code : prev.previewDrawio,
    }));
    if (version.format === "drawio") setEditorVersion((count) => count + 1);
  }

  return (
    <Section>
      <Panel>
        <Field label="Format">
          <ChoiceChips
            options={DIAGRAM_FORMAT_OPTIONS}
            value={form.format}
            onChange={(value) => updateForm("format", value)}
          />
        </Field>
        <TextField
          label="Instruction"
          placeholder="e.g. Flowchart of the login flow"
          value={form.instruction}
          onChangeText={(text) => updateForm("instruction", text)}
          editable={!request.pending}
          maxLength={INSTRUCTION_MAX}
          multiline
          voice
        />
        <TextField
          label="Context (optional)"
          placeholder="Business logic or technical context…"
          value={form.context}
          onChangeText={(text) => updateForm("context", text)}
          editable={!request.pending}
          maxLength={CONTEXT_MAX}
          multiline
          voice
        />
        {isMermaid ? (
          <TextField
            label="Existing Mermaid code (optional)"
            placeholder="Paste existing Mermaid code to refine it…"
            hint={FEEDBACK_HINT}
            value={form.existingMermaid}
            onChangeText={(text) => updateForm("existingMermaid", text)}
            editable={!request.pending}
            maxLength={EXISTING_CODE_MAX}
            multiline
          />
        ) : (
          <TextField
            label="Existing Draw.io code (optional)"
            placeholder="Paste existing Draw.io XML to refine it…"
            hint={FEEDBACK_HINT}
            value={form.existingDrawio}
            onChangeText={(text) => updateForm("existingDrawio", text)}
            editable={!request.pending}
            maxLength={EXISTING_CODE_MAX}
            multiline
          />
        )}
        <ErrorText message={request.error} />
        <ActionButton
          label={request.pending ? "Drawing…" : "Generate diagram"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
        {request.pending && <ActionButton label="Cancel" icon={X} variant="outline" onPress={handleCancel} />}
      </Panel>

      <VersionList
        format={form.format}
        versions={versions}
        disabled={request.pending}
        onRestore={handleRestore}
      />

      {result && (
        <DiagramResultPanel
          result={result}
          isMermaid={isMermaid}
          previewCode={previewCode}
          onRender={handleRender}
          onDrawioSave={handleDrawioSave}
          onDrawioReload={handleDrawioReload}
          editorVersion={editorVersion}
        />
      )}

      {!request.pending && <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />}
    </Section>
  );
}
