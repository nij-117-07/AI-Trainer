// src/features/vision-converter/components/VisionConverterScreen.tsx
/**
 * Vision Converter: choose an image, add an optional instruction, and get structured Markdown.
 * Draft and last result are kept on the device, as the webui keeps them in local state.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import { useCollapsibleForm } from "@/hooks/useCollapsibleForm";
import { useRequest } from "@/hooks/useRequest";
import type { ImageInput } from "@/lib/image";
import { convertImage } from "../lib/generators";
import { INSTRUCTION_MAX } from "../lib/validate";
import { usePersistedVision } from "../hooks/usePersistedVision";
import { ConvertedMarkdown } from "./ConvertedMarkdown";
import { ImageDropField } from "./ImageDropField";

export function VisionConverterScreen() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const draft = usePersistedVision();
  const [image, setImage] = useState<ImageInput | null>(null);
  const form = useCollapsibleForm(draft.markdownOutput !== null);
  const request = useRequest(convertImage);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function handleConvert() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const markdown = await request.run(settings, { image, instruction: draft.instruction }, controller.signal);
    if (markdown !== null) {
      draft.setMarkdownOutput(markdown);
      form.reset();
    }
  }

  function handleReset() {
    controllerRef.current?.abort();
    draft.reset();
    setImage(null);
    form.reset();
    request.reset();
  }

  return (
    <Section>
      <ErrorText message={request.error} />

      {draft.markdownOutput !== null ? (
        <ConvertedMarkdown markdown={draft.markdownOutput} />
      ) : (
        <Panel>
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            Upload an image and the AI will convert it into structured Markdown.
          </Text>
        </Panel>
      )}

      <SettingsToggle
        title="Conversion form"
        summary={draft.instruction.trim() || "Image and instruction"}
        expanded={form.expanded}
        onToggle={form.toggle}
      />

      {form.expanded ? (
        <Panel>
          <View style={styles.formBody}>
            <ImageDropField value={image} onChange={setImage} disabled={request.pending} />
            <TextField
              label="Instruction (optional)"
              placeholder="e.g. Extract all tables and headings."
              value={draft.instruction}
              onChangeText={draft.setInstruction}
              editable={!request.pending}
              voice
              maxLength={INSTRUCTION_MAX}
            />
            <ActionButton
              label={request.pending ? "Converting image…" : "Convert to Markdown"}
              icon={Sparkles}
              loading={request.pending}
              onPress={handleConvert}
            />
            <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
          </View>
        </Panel>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  formBody: {
    gap: spacing.xl,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
});
