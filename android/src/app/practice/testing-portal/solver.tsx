// src/app/practice/testing-portal/solver.tsx
import { SolverTab } from "@/features/testing-portal/components/SolverTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SolverRoute() {
  return (
    <ToolScreen title="Solve an MCQ">
      <SolverTab />
    </ToolScreen>
  );
}
