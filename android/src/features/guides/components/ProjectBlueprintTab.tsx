// src/features/guides/components/ProjectBlueprintTab.tsx
/** Project Blueprint: an industry-specific project with requirements, stretch goals, and criteria. */
import { StyleSheet, Text } from "react-native";
import { AlertTriangle, CheckCircle2, DraftingCompass, Layers, RefreshCcw, Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { generateProjectBlueprint } from "../lib/generators";
import { GUIDE_STORAGE_KEYS } from "../lib/persistence";
import { usePersistedGuide } from "../hooks/usePersistedGuide";
import type { ProjectBlueprintFormValues, ProjectBlueprintResult } from "../types";
import { ListPanel } from "./ResultParts";

const DEFAULTS: ProjectBlueprintFormValues = {
  masterTopic: "Full-stack web development",
  subtopicFocus: "Realtime dashboards",
  targetMastery: "Expert-level troubleshooting",
  preferredIndustry: "Healthcare",
};

export function ProjectBlueprintTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedGuide<
    ProjectBlueprintFormValues,
    ProjectBlueprintResult
  >(GUIDE_STORAGE_KEYS.projectBlueprint, DEFAULTS);
  const request = useRequest(generateProjectBlueprint);

  function update<K extends keyof ProjectBlueprintFormValues>(key: K, value: ProjectBlueprintFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    reset();
    request.reset();
  }

  async function handleGenerate() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Master topic"
          placeholder="e.g. Full-stack web development"
          value={form.masterTopic}
          onChangeText={(text) => update("masterTopic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Subtopic focus"
          placeholder="e.g. Realtime dashboards"
          value={form.subtopicFocus}
          onChangeText={(text) => update("subtopicFocus", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Target mastery"
          placeholder="e.g. Expert-level troubleshooting"
          value={form.targetMastery}
          onChangeText={(text) => update("targetMastery", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Preferred industry (optional)"
          placeholder="e.g. Healthcare"
          value={form.preferredIndustry}
          onChangeText={(text) => update("preferredIndustry", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <ActionButton
          label={request.pending ? "Architecting your project…" : "Generate blueprint"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <Panel>
            <SectionTitle icon={DraftingCompass} title={result.projectName || "Project blueprint"} />
            {(result.industryContext !== "" || result.randomSeed !== "") && (
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {[
                  result.industryContext ? `Industry: ${result.industryContext}` : "",
                  result.randomSeed ? `Build seed: ${result.randomSeed}` : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            )}
          </Panel>

          {result.problemStatement !== "" && (
            <ResultCallout icon={AlertTriangle} title="Problem statement" tone="rose">
              <MarkdownText content={result.problemStatement} />
            </ResultCallout>
          )}
          <ListPanel icon={Layers} title="Technical requirements" items={result.technicalRequirements} />
          <ListPanel icon={Sparkles} title="Stretch goals" items={result.stretchGoals} />
          {result.validationCriteria !== "" && (
            <ResultCallout icon={CheckCircle2} title="Validation criteria" tone="emerald">
              <MarkdownText content={result.validationCriteria} />
            </ResultCallout>
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
});
