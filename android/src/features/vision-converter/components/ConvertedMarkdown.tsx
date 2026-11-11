// src/features/vision-converter/components/ConvertedMarkdown.tsx
/**
 * Converted Markdown result with a Preview / Markdown toggle and a copy button beside it. The
 * viewer has a fixed height and scrolls inside its own box, so the page does not move with the
 * text. The Markdown view is editable, as in the webui, and Share sends the current text (edited
 * or not) to the system share sheet.
 */
import { useEffect, useState } from "react";
import { ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { FileText, Share2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, Panel, TextField } from "@/components/tool/FormControls";
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
      <View style={styles.toolbar}>
        <View style={styles.chips}>
          <ChoiceChips options={VIEW_OPTIONS} value={mode} onChange={setMode} wrap={false} />
        </View>
        {text !== "" && <CopyButton text={text} label="Copy Markdown" />}
      </View>

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
          <ActionButton label="Share Markdown" icon={Share2} variant="outline" onPress={handleShare} />
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  chips: {
    flex: 1,
  },
  viewer: {
    height: 360,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  viewerContent: {
    padding: spacing.md,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  source: {
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 19,
    height: 360,
  },
  actions: {
    gap: spacing.sm,
  },
});
