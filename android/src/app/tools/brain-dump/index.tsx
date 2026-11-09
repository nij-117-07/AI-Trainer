// src/app/tools/brain-dump/index.tsx
import { BrainDumpTool } from "@/features/brain-dump/components/BrainDumpTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function BrainDumpRoute() {
  return (
    <ToolScreen title="Brain Dump & Notes">
      <BrainDumpTool />
    </ToolScreen>
  );
}
