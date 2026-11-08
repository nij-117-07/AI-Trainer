// src/app/practice/executive-eq/index.tsx
import { ExecutiveEqTool } from "@/features/executive-eq/components/ExecutiveEqTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ExecutiveEqRoute() {
  return (
    <ToolScreen title="Executive EQ Trainer">
      <ExecutiveEqTool />
    </ToolScreen>
  );
}
