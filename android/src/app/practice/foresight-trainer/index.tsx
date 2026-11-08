// src/app/practice/foresight-trainer/index.tsx
import { ForesightTool } from "@/features/foresight-trainer/components/ForesightTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ForesightTrainerRoute() {
  return (
    <ToolScreen title="Foresight Trainer">
      <ForesightTool />
    </ToolScreen>
  );
}
