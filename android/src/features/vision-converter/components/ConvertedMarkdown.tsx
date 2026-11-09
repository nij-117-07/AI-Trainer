// src/features/vision-converter/components/ConvertedMarkdown.tsx
/**
 * Converted Markdown result with a Preview / Markdown toggle. The Markdown view is editable, as in
 * the webui, and Share sends the current text (edited or not) to the system share sheet.
 */
import { useEffect, useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { FileText, Share2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";

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
      <ChoiceChips options={VIEW_OPTIONS} value={mode} onChange={setMode} />
      {text === "" ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>The model returned no Markdown.</Text>
      ) : mode === "preview" ? (
        <>
          <MarkdownText content={text} />
          <ListenButton text={text} label="Converted text" />
        </>
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
          <ActionButton label="Share Markdown" icon={Share2} variant="outline" onPress={handleShare} />
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  source: {
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 19,
    minHeight: 240,
  },
  actions: {
    gap: spacing.sm,
  },
});
