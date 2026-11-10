// src/features/markdown-viewer/components/MarkdownViewerTool.tsx
/**
 * Markdown Viewer. The body switches between Write (the editor) and Preview (the rendered text).
 * The footer shares the Markdown. The draft is kept on the device between visits.
 */
import { useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { BookOpen, FileText, PenLine, Share2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { useMarkdownDraft } from "../hooks/useMarkdownDraft";
import { SAMPLE_MARKDOWN } from "../lib/sample";
import { countLines, countWords } from "../lib/stats";

export type MarkdownViewMode = "write" | "preview";

const MODE_OPTIONS: { value: MarkdownViewMode; label: string }[] = [
  { value: "write", label: "Write" },
  { value: "preview", label: "Preview" },
];

interface MarkdownViewerBodyProps {
  draft: ReturnType<typeof useMarkdownDraft>;
  mode: MarkdownViewMode;
  onModeChange: (mode: MarkdownViewMode) => void;
}

export function MarkdownViewerBody({ draft, mode, onModeChange }: MarkdownViewerBodyProps) {
  const { content } = draft;
  const isEmpty = content.trim() === "";

  return (
    <Section>
      <ChoiceChips options={MODE_OPTIONS} value={mode} onChange={onModeChange} />

      {mode === "write" ? (
        <Panel>
          <View style={styles.statsRow}>
            <StatsLine content={content} />
            {!isEmpty && <CopyButton text={content} label="Copy Markdown" />}
          </View>
          <TextField
            label="Markdown"
            placeholder={"# Title\n\nWrite **bold**, *italic*, lists, and `code`…"}
            hint="Headings, bold and italic, lists, quotes, and code blocks are shown in Preview."
            value={content}
            onChangeText={draft.setContent}
            multiline
            voice
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            style={styles.editor}
          />
          {isEmpty && (
            <ActionButton
              label="Load sample"
              icon={FileText}
              variant="outline"
              onPress={() => draft.setContent(SAMPLE_MARKDOWN)}
            />
          )}
        </Panel>
      ) : isEmpty ? (
        <EmptyHint
          icon={BookOpen}
          title="Nothing to preview"
          hint="Switch to Write and type some Markdown. It appears here as it will read."
        />
      ) : (
        <Panel>
          <SectionTitle icon={BookOpen} title="Preview" />
          <MarkdownText content={content} />
        </Panel>
      )}
    </Section>
  );
}

function StatsLine({ content }: { content: string }) {
  const colors = useThemeColors();
  return (
    <Text style={[styles.stats, { color: colors.mutedForeground }]}>
      {countWords(content)} words · {countLines(content)} lines
    </Text>
  );
}

export function MarkdownViewerFooter({ content }: { content: string }) {
  const [shareError, setShareError] = useState<string | null>(null);
  const isEmpty = content.trim() === "";

  async function handleShare() {
    setShareError(null);
    try {
      await Share.share({ title: "document.md", message: content });
    } catch {
      setShareError("Could not share the Markdown. Please try again.");
    }
  }

  return (
    <View style={styles.footer}>
      <ErrorText message={shareError} />
      <ActionButton label="Share Markdown" icon={Share2} disabled={isEmpty} onPress={handleShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  stats: {
    fontSize: 13,
  },
  editor: {
    minHeight: 320,
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    gap: spacing.md,
  },
});
