// src/app/language-learner/simulator/index.tsx
import { SimulatorRunTab } from "@/features/simulator/components/SimulatorRunTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SimulatorRunRoute() {
  return (
    <ToolScreen title="Simulator Run">
      <SimulatorRunTab />
    </ToolScreen>
  );
}
