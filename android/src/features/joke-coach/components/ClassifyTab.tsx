// src/features/joke-coach/components/ClassifyTab.tsx
/** Classify mode: break down a joke's style, humor mechanism, structure, and practice level. */
import { StyleSheet, Text, View } from "react-native";
import { RefreshCcw, Sparkles, Tags } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { ListenButton } from "@/components/tool/ListenButton";
import { TagList } from "@/components/tool/TagList";
import { classifyJoke } from "../lib/generators";
import { JOKE_COACH_STORAGE_KEYS } from "../lib/persistence";
import { useJokeMode } from "../hooks/useJokeMode";
import type { ClassifyJokeFormValues, JokeClassification } from "../types";
import { EmptyNote, Label } from "./ResultParts";

const DEFAULTS: ClassifyJokeFormValues = {
  jokeText: "Why do programmers prefer dark mode? Because light attracts bugs.",
};

export function ClassifyTab() {
  const colors = useThemeColors();
  const mode = useJokeMode<ClassifyJokeFormValues, JokeClassification>(
    JOKE_COACH_STORAGE_KEYS.classify,
    DEFAULTS,
    classifyJoke,
  );
  const { form, update, result, pending } = mode;

  return (
    <Section>
      <Panel>
        <TextField
          label="The joke"
          placeholder="Paste a joke to analyze."
          value={form.jokeText}
          onChangeText={(text) => update("jokeText", text)}
          editable={!pending}
          maxLength={5000}
          multiline
          voice
        />
        <ActionButton
          label={pending ? "Analyzing the humor…" : "Classify joke"}
          icon={Sparkles}
          loading={pending}
          onPress={mode.run}
        />
      </Panel>

      <ErrorText message={mode.error} />

      {result ? (
        <Panel>
          <View style={styles.badges}>
            <Badge label={result.style} tone={colors.tone.sky} />
            <Badge label={result.humorMechanism} tone={colors.tone.rose} />
            <Badge label={`Practice: ${result.practiceCategory}`} tone={colors.tone.emerald} />
          </View>
          <View style={styles.block}>
            <Label>Structure</Label>
            <Text style={[styles.text, { color: colors.foreground }]}>{result.structure || "Not returned."}</Text>
            <ListenButton text={result.structure} label="Structure" />
          </View>
          <View style={styles.block}>
            <SectionTitle icon={Tags} title="Tags" />
            {result.tags.length > 0 ? <TagList items={result.tags} /> : <EmptyNote message="No tags were returned." />}
          </View>
          <View style={styles.block}>
            <Label>Similar styles</Label>
            {result.similarJokeStyles.length > 0 ? (
              <TagList items={result.similarJokeStyles} />
            ) : (
              <EmptyNote message="No similar styles were returned." />
            )}
          </View>
        </Panel>
      ) : (
        <EmptyNote message="Paste a joke to see how its humor works." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={mode.reset} />
    </Section>
  );
}

function Badge({ label, tone }: { label: string; tone: { bg: string; border: string; fg: string } }) {
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  block: {
    gap: spacing.sm,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
});
