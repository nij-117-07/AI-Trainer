// src/app/learning/explainer/socratic.tsx
import { SocraticTab } from "@/features/explainer/components/SocraticTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SocraticRoute() {
  return (
    <ToolScreen title="Socratic Mentor">
      <SocraticTab />
    </ToolScreen>
  );
}
