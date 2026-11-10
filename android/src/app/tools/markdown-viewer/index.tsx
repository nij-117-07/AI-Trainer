// src/app/tools/markdown-viewer/index.tsx
/** Markdown Viewer route: write Markdown, preview it, and share it. Reset clears the draft after confirmation. */
import { useState } from "react";
import { Alert } from "react-native";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  MarkdownViewerBody,
  MarkdownViewerFooter,
  type MarkdownViewMode,
} from "@/features/markdown-viewer/components/MarkdownViewerTool";
import { useMarkdownDraft } from "@/features/markdown-viewer/hooks/useMarkdownDraft";

export default function MarkdownViewerRoute() {
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
      headerRight={<ResetButton onPress={confirmReset} />}
      footer={<MarkdownViewerFooter content={draft.content} />}
    >
      {draft.loaded && <MarkdownViewerBody draft={draft} mode={mode} onModeChange={setMode} />}
    </ToolScreen>
  );
}
