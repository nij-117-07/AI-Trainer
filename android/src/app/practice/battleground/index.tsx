// src/app/practice/battleground/index.tsx
import { BattlegroundTab } from "@/features/battleground/components/BattlegroundTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function BattlegroundRoute() {
  return (
    <ToolScreen title="Battleground Simulator">
      <BattlegroundTab />
    </ToolScreen>
  );
}
