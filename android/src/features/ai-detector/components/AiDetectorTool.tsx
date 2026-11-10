// src/features/ai-detector/components/AiDetectorTool.tsx
/**
 * AI Detector: scores a text for AI likelihood and lists the patterns behind the score. The form
 * sits in the footer; the last result is kept on the device and shown above it.
 */
import { ScrollView, StyleSheet, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { COMMENTS_MAX, TEXT_MAX } from "../lib/validate";
import type { AiDetectorState } from "../hooks/useAiDetector";
import { DetectionResultCard } from "./DetectionResultCard";

export function AiDetectorResults({ detector }: { detector: AiDetectorState }) {
  const { result } = detector;

  return (
    <Section>
      {result ? (
        <DetectionResultCard result={result} />
      ) : (
        <EmptyHint
          icon={ShieldCheck}
          title="No analysis yet"
          hint="Paste the text below, then tap Detect AI content to see the AI score and the patterns behind it."
        />
      )}
    </Section>
  );
}

export function AiDetectorFooter({ detector }: { detector: AiDetectorState }) {
  const { form, pending, error, update, submit } = detector;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Text to analyze"
          placeholder="Paste the paragraph, essay, or post you want checked…"
          hint="Up to 50,000 characters. The text is sent to your AI provider and saved on this device until you reset."
          value={form.textToCheck}
          onChangeText={(text) => update("textToCheck", text)}
          editable={!pending}
          maxLength={TEXT_MAX}
          multiline
          voice
        />
        <TextField
          label="Additional context (optional)"
          placeholder="e.g. A school essay, or a post from a blog"
          value={form.additionalComments}
          onChangeText={(text) => update("additionalComments", text)}
          editable={!pending}
          maxLength={COMMENTS_MAX}
          multiline
          voice
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Analyzing…" : "Detect AI content"}
        icon={ShieldCheck}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 380,
  },
  fieldsContent: {
    gap: spacing.md,
  },
});
