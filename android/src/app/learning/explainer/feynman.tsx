// src/app/learning/explainer/feynman.tsx
import { FeynmanTab } from "@/features/explainer/components/FeynmanTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function FeynmanRoute() {
  return (
    <ToolScreen title="Feynman Explainer">
      <FeynmanTab />
    </ToolScreen>
  );
}
