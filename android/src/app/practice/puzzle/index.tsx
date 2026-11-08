// src/app/practice/puzzle/index.tsx
import { PuzzleScreen } from "@/features/puzzle/components/PuzzleScreen";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function PuzzleRoute() {
  return (
    <ToolScreen title="Puzzle Generator">
      <PuzzleScreen />
    </ToolScreen>
  );
}
