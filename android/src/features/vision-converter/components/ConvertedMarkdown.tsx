// src/features/vision-converter/components/ConvertedMarkdown.tsx
/**
 * Converted Markdown result with a Preview / Markdown toggle. Listen, Copy, and Share are icon
 * buttons under the text. The viewer has a fixed height and scrolls inside its own box, so the page
 * does not move with the text. The Markdown view is editable, as in the webui, and Share sends the
 * current text (edited or not) to the system share sheet.
 */
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { FileText, Share2 } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ChoiceChips, Panel, pointerCursor, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { CopyButton } from "@/components/tool/CopyButton";

type ViewMode = "preview" | "source";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "preview", label: "Preview" },
  { value: "source", label: "Markdown" },
];

export function ConvertedMarkdown({ markdown }: { markdown: string }) {
  const colors = useThemeColors();
  const [text, setText] = useState(markdown);
  const [mode, setMode] = useState<ViewMode>("preview");

  useEffect(() => {
    setText(markdown);
  }, [markdown]);

  async function handleShare() {
    await Share.share({ message: text }).catch(() => undefined);
  }

  return (
    <Panel>
      <SectionTitle icon={FileText} title="Converted Markdown" />
      <ChoiceChips options={VIEW_OPTIONS} value={mode} onChange={setMode} wrap={false} />

      {text === "" ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          The model returned no Markdown. Try a clearer image or a more specific instruction.
        </Text>
      ) : mode === "preview" ? (
        <View style={[styles.viewer, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <ScrollView nestedScrollEnabled contentContainerStyle={styles.viewerContent}>
            <MarkdownText content={text} />
          </ScrollView>
        </View>
      ) : (
        <TextField
          label="Markdown source"
          value={text}
          onChangeText={setText}
          multiline
          style={styles.source}
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}

      {text !== "" && (
        <View style={styles.actions}>
          {mode === "preview" ? <ListenButton text={text} label="Converted text" /> : null}
          <CopyButton text={text} label="Copy Markdown" />
          <Pressable
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share Markdown"
            style={({ pressed }) => [
              styles.iconButton,
              pointerCursor,
              { borderColor: colors.border, backgroundColor: colors.card },
              pressed && { backgroundColor: colors.muted },
            ]}
          >
            <Share2 size={20} color={colors.foreground} />
          </Pressable>
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  viewer: {
    height: 360,
    borderWidth: 1,
    borderRadius: shape.lg,
    overflow: "hidden",
  },
  viewerContent: {
    padding: spacing.md,
  },
  empty: {
    ...typeScale.body,
  },
  source: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 22,
    height: 360,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
