// src/app/language-learner/idioms/index.tsx
import { IdiomsTool } from "@/features/idioms/components/IdiomsTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function IdiomsRoute() {
  return (
    <ToolScreen title="Idioms">
      <IdiomsTool />
    </ToolScreen>
  );
}
