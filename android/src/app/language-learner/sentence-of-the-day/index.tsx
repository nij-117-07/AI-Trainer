// src/app/language-learner/sentence-of-the-day/index.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SentenceOfTheDayTool } from "@/features/sentence-of-the-day/components/SentenceOfTheDayTool";

export default function SentenceOfTheDayRoute() {
  return (
    <ToolScreen title="Sentence of the Day">
      <SentenceOfTheDayTool />
    </ToolScreen>
  );
}
