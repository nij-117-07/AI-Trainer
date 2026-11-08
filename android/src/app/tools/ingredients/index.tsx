// src/app/tools/ingredients/index.tsx
import { IngredientsTab } from "@/features/ingredients/components/IngredientsTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function IngredientsRoute() {
  return (
    <ToolScreen title="Ingredients Checker">
      <IngredientsTab />
    </ToolScreen>
  );
}
