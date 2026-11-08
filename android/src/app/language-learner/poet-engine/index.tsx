// src/app/language-learner/poet-engine/index.tsx
/** Poet Engine route: explains the soul of a word in a poetic style. */
import { PoetEngineTool } from "@/features/poet-engine/components/PoetEngineTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function PoetEngineRoute() {
  return (
    <ToolScreen title="Poet Engine">
      <PoetEngineTool />
    </ToolScreen>
  );
}
