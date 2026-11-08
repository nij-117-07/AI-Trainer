// src/app/practice/testing-portal/answer.tsx
import { AnswerTab } from "@/features/testing-portal/components/AnswerTab";
import { ToolScreen } from "@/features/testing-portal/components/ToolScreen";

export default function AnswerRoute() {
  return (
    <ToolScreen title="Expert answer">
      <AnswerTab />
    </ToolScreen>
  );
}
