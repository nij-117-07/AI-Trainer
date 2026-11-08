// src/app/tools/diagram/index.tsx
import { DiagramTool } from "@/features/diagram/components/DiagramTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function DiagramRoute() {
  return (
    <ToolScreen title="Diagram Generator">
      <DiagramTool />
    </ToolScreen>
  );
}
