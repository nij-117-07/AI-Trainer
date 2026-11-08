// src/app/language-learner/simulator/prompts.tsx
import { SimulatorPromptsTab } from "@/features/simulator/components/SimulatorPromptsTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SimulatorPromptsRoute() {
  return (
    <ToolScreen title="Simulator Prompts">
      <SimulatorPromptsTab />
    </ToolScreen>
  );
}
