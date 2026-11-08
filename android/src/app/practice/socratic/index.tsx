// src/app/practice/socratic/index.tsx
import { SocraticTab } from "@/features/socratic/components/SocraticTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SocraticRoute() {
  return (
    <ToolScreen title="Socratic Challenger">
      <SocraticTab />
    </ToolScreen>
  );
}
