// src/features/joke-coach/components/GenerateTab.tsx
/** Generate mode: write an original joke from a topic, style, and audience. */
import { StyleSheet, Text, View } from "react-native";
import { Laugh, RefreshCcw, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { JOKE_STYLE_OPTIONS } from "../options";
import { generateJoke } from "../lib/generators";
import { JOKE_COACH_STORAGE_KEYS } from "../lib/persistence";
import { useJokeMode } from "../hooks/useJokeMode";
import type { GenerateJokeFormValues, GeneratedJoke } from "../types";
import { EmptyNote, Label } from "./ResultParts";

const DEFAULTS: GenerateJokeFormValues = {
  topic: "programming",
  jokeStyle: "dad-joke",
  audience: "tech workers",
};

export function GenerateTab() {
  const colors = useThemeColors();
  const mode = useJokeMode<GenerateJokeFormValues, GeneratedJoke>(
    JOKE_COACH_STORAGE_KEYS.generate,
    DEFAULTS,
    generateJoke,
  );
  const { form, update, result, pending } = mode;

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. programming, cats, coffee"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={300}
        />
        <SelectField
          label="Joke style"
          options={JOKE_STYLE_OPTIONS}
          value={form.jokeStyle}
          onChange={(value) => update("jokeStyle", value)}
          allowCustom={false}
        />
        <TextField
          label="Audience"
          placeholder="e.g. tech workers, family, general"
          value={form.audience}
          onChangeText={(text) => update("audience", text)}
          editable={!pending}
          maxLength={300}
        />
        <ActionButton
          label={pending ? "Writing your joke…" : "Generate joke"}
          icon={Sparkles}
          loading={pending}
          onPress={mode.run}
        />
      </Panel>

      <ErrorText message={mode.error} />

      {result ? (
        <Panel>
          <SectionTitle icon={Laugh} title="Your joke" />
          <View style={styles.block}>
            <Label>Setup</Label>
            <MarkdownText content={result.setup || "—"} />
          </View>
          <View style={styles.block}>
            <Label>Punchline</Label>
            <MarkdownText content={result.punchline || "—"} />
          </View>
          <View style={[styles.highlight, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.jokeLabel, { color: colors.mutedForeground }]}>The joke</Text>
            <MarkdownText content={result.joke || "No joke text was returned."} />
          </View>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            Humor: {result.humorType || "unspecified"} · Delivery difficulty: {result.difficultyRating}/5
          </Text>
        </Panel>
      ) : (
        <EmptyNote message="Pick a topic and the coach will write you an original joke." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={mode.reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  highlight: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  jokeLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
  },
});
