// src/app/practice/testing-portal/theoretical.tsx
import { TheoreticalTab } from "@/features/testing-portal/components/TheoreticalTab";
import { ToolScreen } from "@/features/testing-portal/components/ToolScreen";

export default function TheoreticalRoute() {
  return (
    <ToolScreen title="Theoretical">
      <TheoreticalTab />
    </ToolScreen>
  );
}
