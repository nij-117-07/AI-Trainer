// src/app/practice/clarity-trainer/index.tsx
import { ClarityTrainerTool } from "@/features/clarity-trainer/components/ClarityTrainerTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ClarityTrainerRoute() {
  return (
    <ToolScreen title="Clarity Trainer">
      <ClarityTrainerTool />
    </ToolScreen>
  );
}
