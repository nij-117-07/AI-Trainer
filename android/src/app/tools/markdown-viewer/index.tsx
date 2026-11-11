// src/app/tools/markdown-viewer/index.tsx
/** Markdown Viewer route: write Markdown, preview it, and share it. Clear removes the draft after confirmation. */
import { useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { Trash2 } from "lucide-react-native";
import { shape, touchTarget, useThemeColors } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  MarkdownViewerBody,
  MarkdownViewerFooter,
  type MarkdownViewMode,
} from "@/features/markdown-viewer/components/MarkdownViewerTool";
import { useMarkdownDraft } from "@/features/markdown-viewer/hooks/useMarkdownDraft";

export default function MarkdownViewerRoute() {
  const colors = useThemeColors();
  const draft = useMarkdownDraft();
  const [mode, setMode] = useState<MarkdownViewMode>("write");

  function confirmReset() {
    if (draft.content.trim() === "") return;
    Alert.alert("Clear the Markdown?", "The text you wrote here will be removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: draft.reset },
    ]);
  }

  return (
    <ToolScreen
      title="Markdown Viewer"
      headerRight={
        <Pressable
          onPress={confirmReset}
          accessibilityRole="button"
          accessibilityLabel="Clear Markdown"
          style={({ pressed }) => [styles.clearButton, pressed && { backgroundColor: colors.muted }]}
        >
          <Trash2 size={24} color={colors.foreground} />
        </Pressable>
      }
      footerSide={false}
      footer={<MarkdownViewerFooter content={draft.content} />}
    >
      {draft.loaded && <MarkdownViewerBody draft={draft} mode={mode} onModeChange={setMode} />}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
