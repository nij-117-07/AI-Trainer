// src/app/learning/explainer/atoz.tsx
import { AtozTab } from "@/features/explainer/components/AtozTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function AtozRoute() {
  return (
    <ToolScreen title="A-to-Z Tutorial">
      <AtozTab />
    </ToolScreen>
  );
}
