// src/app/practice/debate/index.tsx
import { DebateTool } from "@/features/debate/components/DebateTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function DebateRoute() {
  return (
    <ToolScreen title="Debate Engine">
      <DebateTool />
    </ToolScreen>
  );
}
