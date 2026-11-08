// src/app/practice/testing-portal/mcq.tsx
import { McqTab } from "@/features/testing-portal/components/McqTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function McqRoute() {
  return (
    <ToolScreen title="MCQs">
      <McqTab />
    </ToolScreen>
  );
}
