// src/app/language-learner/lesson/index.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { LessonTool } from "@/features/lesson/components/LessonTool";

export default function LessonRoute() {
  return (
    <ToolScreen title="Language Lesson">
      <LessonTool />
    </ToolScreen>
  );
}
