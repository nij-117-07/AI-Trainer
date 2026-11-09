// src/features/guides/components/SuggestTopicsTab.tsx
/** Topic Suggestions: next-topic recommendations that build on what you know, without repeats. */
import { StyleSheet, Text } from "react-native";
import { Lightbulb, RefreshCcw, Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { suggestTopics } from "../lib/generators";
import { GUIDE_STORAGE_KEYS } from "../lib/persistence";
import { TOPIC_LEVEL_OPTIONS } from "../options";
import { usePersistedGuide } from "../hooks/usePersistedGuide";
import type { SuggestTopicsFormValues, SuggestTopicsResult } from "../types";
import { EmptyNote } from "./ResultParts";

const DEFAULTS: SuggestTopicsFormValues = {
  broaderTopic: "Cybersecurity",
  specificInterest: "Web application security",
  learnedBefore: "Flask routing and SQL basics.",
  previousSuggestions: "",
  customUserInput: "Focus on hands-on prevention techniques.",
  topicLevel: "Intermediate",
};

export function SuggestTopicsTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedGuide<
    SuggestTopicsFormValues,
    SuggestTopicsResult
  >(GUIDE_STORAGE_KEYS.suggestTopics, DEFAULTS);
  const request = useRequest(suggestTopics);

  function update<K extends keyof SuggestTopicsFormValues>(key: K, value: SuggestTopicsFormValues[K]) {
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
          label="Broader topic"
          placeholder="e.g. Cybersecurity"
          value={form.broaderTopic}
          onChangeText={(text) => update("broaderTopic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Specific interest"
          placeholder="e.g. Web application security"
          value={form.specificInterest}
          onChangeText={(text) => update("specificInterest", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Background knowledge"
          placeholder="What do you already know to build on?"
          value={form.learnedBefore}
          onChangeText={(text) => update("learnedBefore", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
          voice
        />
        <TextField
          label="Previously suggested topics (optional)"
          placeholder="One per line…"
          hint="These will not be repeated."
          value={form.previousSuggestions}
          onChangeText={(text) => update("previousSuggestions", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <TextField
          label="Custom input (optional)"
          placeholder="Specific constraints or requests…"
          value={form.customUserInput}
          onChangeText={(text) => update("customUserInput", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
          voice
        />
        <SelectField
          label="Topic level"
          options={TOPIC_LEVEL_OPTIONS}
          value={form.topicLevel}
          onChange={(value) => update("topicLevel", value)}
          allowCustom={false}
        />
        <ActionButton
          label={request.pending ? "Finding next topics…" : "Suggest topics"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <SectionTitle icon={Lightbulb} title="Recommended next topics" />
          {result.recommendations.length === 0 ? (
            <EmptyNote message="No topic recommendations returned." />
          ) : (
            result.recommendations.map((item, index) => (
              <Panel key={`${item.topicName}-${index}`}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {index + 1}. {item.topicName}
                </Text>
                {item.reason !== "" && <MarkdownText content={item.reason} />}
                {item.reason !== "" && <ListenButton text={item.reason} label="Reason" />}
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
});
