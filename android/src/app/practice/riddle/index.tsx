// src/app/practice/riddle/index.tsx
import { RiddleTab } from "@/features/riddle/components/RiddleTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function RiddleRoute() {
  return (
    <ToolScreen title="Riddle Generator">
      <RiddleTab />
    </ToolScreen>
  );
}
