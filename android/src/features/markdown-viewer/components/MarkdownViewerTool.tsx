// src/features/markdown-viewer/components/MarkdownViewerTool.tsx
/** Markdown Viewer: edit a draft on top and preview the rendered result below. The draft persists on the device. */
import { useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { BookOpen, Eraser, FileText, RotateCcw, Share2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useMarkdownDraft } from "../hooks/useMarkdownDraft";
import { SAMPLE_MARKDOWN } from "../lib/sample";
import { countLines, countWords } from "../lib/stats";

export function MarkdownViewerTool() {
  const colors = useThemeColors();
  const { content, setContent } = useMarkdownDraft();
  const [shareError, setShareError] = useState<string | null>(null);

  async function handleShare() {
    setShareError(null);
    try {
      await Share.share({ title: "document.md", message: content });
    } catch {
      setShareError("Could not share the Markdown. Please try again.");
    }
  }

  return (
    <Section>
      <Panel>
        <SectionTitle icon={FileText} title="Editor" />
        <Text style={[styles.stats, { color: colors.mutedForeground }]}>
          {content.length} chars · {countWords(content)} words · {countLines(content)} lines
        </Text>
        <TextField
          label="Markdown"
          placeholder="Write your Markdown here…"
          value={content}
          onChangeText={setContent}
          multiline
          voice
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          style={styles.editor}
        />
        <View style={styles.actions}>
          <View style={styles.action}>
            <ActionButton label="Share" icon={Share2} variant="outline" onPress={handleShare} />
          </View>
          <View style={styles.action}>
            <ActionButton label="Sample" icon={RotateCcw} variant="outline" onPress={() => setContent(SAMPLE_MARKDOWN)} />
          </View>
          <View style={styles.action}>
            <ActionButton label="Clear" icon={Eraser} variant="outline" onPress={() => setContent("")} />
          </View>
        </View>
        <ErrorText message={shareError} />
      </Panel>

      <Panel>
        <SectionTitle icon={BookOpen} title="Preview" />
        {content.trim() ? (
          <MarkdownText content={content} />
        ) : (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>Nothing to preview yet.</Text>
        )}
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  stats: {
    fontSize: 13,
  },
  editor: {
    minHeight: 260,
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  action: {
    flexGrow: 1,
    minWidth: 140,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
