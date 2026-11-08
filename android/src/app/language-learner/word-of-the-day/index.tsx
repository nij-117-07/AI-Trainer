// src/app/language-learner/word-of-the-day/index.tsx
import { WordOfTheDayTool } from "@/features/word-of-the-day/components/WordOfTheDayTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function WordOfTheDayRoute() {
  return (
    <ToolScreen title="Word of the Day">
      <WordOfTheDayTool />
    </ToolScreen>
  );
}
