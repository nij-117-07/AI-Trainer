// src/features/ai-detector/components/AiDetectorTool.tsx
/**
 * AI Detector: the text form sits at the top of the page, the Detect button stays in the footer,
 * and the last result is kept on the device and shown after the form.
 */
import { StyleSheet, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { COMMENTS_MAX, TEXT_MAX } from "../lib/validate";
import type { AiDetectorState } from "../hooks/useAiDetector";
import { DetectionResultCard } from "./DetectionResultCard";

export function AiDetectorForm({ detector }: { detector: AiDetectorState }) {
  const { form, pending, update } = detector;

  return (
    <Panel>
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
        style={styles.textArea}
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
    </Panel>
  );
}

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
          hint="Paste text in the form, then tap Detect AI content to see the AI score and the patterns behind it."
        />
      )}
    </Section>
  );
}

export function AiDetectorFooter({ detector }: { detector: AiDetectorState }) {
  const { pending, error, submit } = detector;

  return (
    <View style={styles.footer}>
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
  textArea: {
    minHeight: 200,
  },
});
