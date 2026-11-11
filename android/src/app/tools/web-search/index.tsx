// src/app/tools/web-search/index.tsx
import { WebSearchTool } from "@/features/web-search/components/WebSearchTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function WebSearchRoute() {
  return (
    <ToolScreen title="Web Search" usesAi={false} wide>
      <WebSearchTool />
    </ToolScreen>
  );
}
