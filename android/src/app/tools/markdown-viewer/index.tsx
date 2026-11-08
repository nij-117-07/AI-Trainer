// src/app/tools/markdown-viewer/index.tsx
import { MarkdownViewerTool } from "@/features/markdown-viewer/components/MarkdownViewerTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function MarkdownViewerRoute() {
  return (
    <ToolScreen title="Markdown Viewer">
      <MarkdownViewerTool />
    </ToolScreen>
  );
}
