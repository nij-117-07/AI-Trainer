// src/features/vision-converter/components/VisionConverterScreen.tsx
/**
 * Vision Converter: choose an image, add an optional instruction, and get structured Markdown.
 * The form is at the top of the page and the convert button stays in the footer. The last Markdown
 * is kept on the device and shown after the form.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ImagePlus, Sparkles } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import type { ImageInput } from "@/lib/image";
import { convertImage } from "../lib/generators";
import { INSTRUCTION_MAX } from "../lib/validate";
import { usePersistedVision } from "../hooks/usePersistedVision";
import { ConvertedMarkdown } from "./ConvertedMarkdown";
import { ImageDropField } from "./ImageDropField";

export interface VisionConverterState {
  image: ImageInput | null;
  setImage: (image: ImageInput | null) => void;
  instruction: string;
  setInstruction: (instruction: string) => void;
  markdownOutput: string | null;
  pending: boolean;
  error: string | null;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useVisionConverter(): VisionConverterState {
  const { settings } = useAiSettings();
  const draft = usePersistedVision();
  const [image, setImage] = useState<ImageInput | null>(null);
  const request = useRequest(convertImage);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function submit() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const markdown = await request.run(settings, { image, instruction: draft.instruction }, controller.signal);
    if (markdown !== null && !controller.signal.aborted) draft.setMarkdownOutput(markdown);
  }

  function reset() {
    controllerRef.current?.abort();
    draft.reset();
    setImage(null);
    request.reset();
  }

  return {
    image,
    setImage,
    instruction: draft.instruction,
    setInstruction: draft.setInstruction,
    markdownOutput: draft.markdownOutput,
    pending: request.pending,
    error: request.error,
    submit,
    reset,
  };
}

export function VisionConverterForm({ vision }: { vision: VisionConverterState }) {
  const { image, setImage, instruction, setInstruction, pending } = vision;

  return (
    <Panel>
      <ImageDropField value={image} onChange={setImage} disabled={pending} />
      <TextField
        label="Instruction (optional)"
        placeholder="e.g. Extract all tables and headings."
        value={instruction}
        onChangeText={setInstruction}
        editable={!pending}
        maxLength={INSTRUCTION_MAX}
        voice
      />
    </Panel>
  );
}

export function VisionConverterResults({ vision }: { vision: VisionConverterState }) {
  const colors = useThemeColors();

  return (
    <Section>
      {vision.markdownOutput !== null ? (
        <ConvertedMarkdown markdown={vision.markdownOutput} />
      ) : (
        <Panel>
          <View style={styles.empty}>
            <ImagePlus size={20} color={colors.mutedForeground} />
            <View style={styles.emptyText}>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Markdown yet</Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Convert an image to see it here.</Text>
            </View>
          </View>
        </Panel>
      )}
    </Section>
  );
}

export function VisionConverterFooter({ vision }: { vision: VisionConverterState }) {
  const { pending, error, submit } = vision;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Converting…" : "Convert image"}
        icon={Sparkles}
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
  empty: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  emptyText: {
    flex: 1,
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typeScale.label,
    fontWeight: "600",
  },
  emptyHint: {
    ...typeScale.body,
  },
});
