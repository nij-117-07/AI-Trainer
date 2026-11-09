// src/features/charts/components/ChartsTool.tsx
/** Chart.js Generator: data and style form, live preview, generated code, and version history. */
import { useEffect, useRef, useState } from "react";
import { Share } from "react-native";
import { ChartColumn, Code2, Lightbulb, Play, RefreshCcw, Share2, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { usePersistedChart } from "../hooks/usePersistedChart";
import { useChartHistory } from "../hooks/useChartHistory";
import { generateChart } from "../lib/generators";
import { versionLabel } from "../lib/history";
import { CHART_STORAGE_KEYS } from "../lib/persistence";
import type { ChartFormValues, ChartResult } from "../types";
import { ChartCode } from "./ChartCode";
import { ChartPreview } from "./ChartPreview";

const DEFAULTS: ChartFormValues = {
  dataInput: "[{ label: 'Jan', value: 12 }, { label: 'Feb', value: 19 }, { label: 'Mar', value: 3 }]",
  customInstructions: "Bar chart, blue bars, dark theme, rounded corners.",
  previousCode: "",
};

export function ChartsTool() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedChart<ChartFormValues, ChartResult>(
    CHART_STORAGE_KEYS.draft,
    DEFAULTS,
  );
  const { versions, addVersion } = useChartHistory();
  const request = useRequest(generateChart);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const resultCode = result?.chartDivCode ?? "";
  const [shownCode, setShownCode] = useState(resultCode);
  const [seenCode, setSeenCode] = useState(resultCode);
  if (resultCode !== seenCode) {
    setSeenCode(resultCode);
    setShownCode(resultCode);
  }

  const cancelled = controllerRef.current?.signal.aborted ?? false;
  const error = cancelled ? null : request.error;

  function update<K extends keyof ChartFormValues>(key: K, value: ChartFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    request.reset();
  }

  async function handleGenerate() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
    if (!next || controller.signal.aborted) return;
    setResult(next);
    setForm((prev) => ({ ...prev, previousCode: next.chartDivCode }));
    addVersion(next.chartDivCode);
  }

  function handleRender() {
    const code = form.previousCode.trim();
    if (code) setShownCode(code);
  }

  function handleRestore(savedAt: string) {
    const version = versions.find((entry) => entry.savedAt === savedAt);
    if (!version) return;
    setForm((prev) => ({ ...prev, previousCode: version.code }));
    setShownCode(version.code);
  }

  function handleShare() {
    const code = shownCode || resultCode;
    if (!code) return;
    Share.share({ message: code, title: "chart.html" }).catch(() => undefined);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Data Input"
          placeholder="JSON, CSV, or plain text…"
          value={form.dataInput}
          onChangeText={(text) => update("dataInput", text)}
          editable={!request.pending}
          maxLength={20000}
          multiline
        />
        <TextField
          label="Custom Instructions"
          placeholder="Chart type, colors, labels, theme…"
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
          voice
        />
        <TextField
          label="Previous Code (optional)"
          placeholder="Existing Chart.js code to refactor…"
          hint="Generated code is fed back here, so each run refines the previous result."
          value={form.previousCode}
          onChangeText={(text) => update("previousCode", text)}
          editable={!request.pending}
          maxLength={20000}
          multiline
        />
        {versions.length > 0 && (
          <SelectField
            label="Restore a previous version"
            options={versions.map((version) => ({ value: version.savedAt, label: versionLabel(version) }))}
            value=""
            onChange={handleRestore}
            allowCustom={false}
          />
        )}
        <ActionButton
          label={request.pending ? "Plotting…" : "Generate chart"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={error} />

      {result && (
        <>
          {result.answerMessage !== "" && (
            <ResultCallout icon={Lightbulb} title="Summary" tone="sky">
              <MarkdownText content={result.answerMessage} />
              <ListenButton text={result.answerMessage} label="Summary" />
            </ResultCallout>
          )}

          <Panel>
            <SectionTitle icon={ChartColumn} title="Preview" />
            <ActionButton label="Render previous code" icon={Play} variant="outline" onPress={handleRender} />
            <ChartPreview code={shownCode} />
          </Panel>

          <Panel>
            <SectionTitle icon={Code2} title="Chart.js code" />
            <ChartCode code={shownCode || resultCode} />
            <ActionButton label="Share code" icon={Share2} variant="outline" onPress={handleShare} />
          </Panel>
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}
