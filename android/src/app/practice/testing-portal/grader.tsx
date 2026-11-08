// src/app/practice/testing-portal/grader.tsx
import { GraderTab } from "@/features/testing-portal/components/GraderTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function GraderRoute() {
  return (
    <ToolScreen title="Performance Grader">
      <GraderTab />
    </ToolScreen>
  );
}
