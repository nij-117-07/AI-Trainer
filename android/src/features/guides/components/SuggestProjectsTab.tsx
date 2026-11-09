// src/features/guides/components/SuggestProjectsTab.tsx
/** Project Suggestions: strategic project use cases for a technology and an industry. */
import { StyleSheet, Text, View } from "react-native";
import { FolderGit2, Compass, RefreshCcw, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { suggestProjects } from "../lib/generators";
import { GUIDE_STORAGE_KEYS } from "../lib/persistence";
import { usePersistedGuide } from "../hooks/usePersistedGuide";
import type { SuggestProjectsFormValues, SuggestProjectsResult } from "../types";
import { EmptyNote } from "./ResultParts";

const DEFAULTS: SuggestProjectsFormValues = {
  topic: "Vector search",
  industry: "Healthcare",
  numUseCases: 3,
  userInstructions: "",
  existingSuggestions: "",
};

export function SuggestProjectsTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedGuide<
    SuggestProjectsFormValues,
    SuggestProjectsResult
  >(GUIDE_STORAGE_KEYS.suggestProjects, DEFAULTS);
  const request = useRequest(suggestProjects);

  function update<K extends keyof SuggestProjectsFormValues>(key: K, value: SuggestProjectsFormValues[K]) {
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
          label="Topic / technology"
          placeholder="e.g. Vector search"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Industry"
          placeholder="e.g. Healthcare"
          value={form.industry}
          onChangeText={(text) => update("industry", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <CountSlider
          label="Number of use cases"
          max={10}
          value={form.numUseCases}
          onChange={(value) => update("numUseCases", value)}
        />
        <TextField
          label="Instructions (optional)"
          placeholder="Specific constraints or preferences…"
          value={form.userInstructions}
          onChangeText={(text) => update("userInstructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
          voice
        />
        <TextField
          label="Existing suggestions (optional)"
          placeholder="One per line…"
          hint="These project titles will not be repeated."
          value={form.existingSuggestions}
          onChangeText={(text) => update("existingSuggestions", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <ActionButton
          label={request.pending ? "Drafting use cases…" : "Suggest projects"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          {result.briefStrategy !== "" && (
            <ResultCallout icon={Compass} title="Strategy" tone="sky">
              <MarkdownText content={result.briefStrategy} />
              <ListenButton text={result.briefStrategy} label="Strategy" />
            </ResultCallout>
          )}

          <SectionTitle icon={FolderGit2} title="Project use cases" />
          {result.projects.length === 0 ? (
            <EmptyNote message="No projects were returned." />
          ) : (
            result.projects.map((project, index) => (
              <Panel key={`${project.title}-${index}`}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {index + 1}. {project.title || "Untitled project"}
                </Text>
                {project.problem !== "" && <MarkdownText content={project.problem} />}
                {project.problem !== "" && <ListenButton text={project.problem} label="Project" />}
                {project.keyFeatures.length > 0 && (
                  <View style={styles.features}>
                    <Text style={[styles.featuresLabel, { color: colors.mutedForeground }]}>Key features</Text>
                    <MarkdownText content={project.keyFeatures.map((feature) => `- ${feature}`).join("\n")} />
                  </View>
                )}
              </Panel>
            ))
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  features: {
    gap: spacing.sm,
  },
  featuresLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
