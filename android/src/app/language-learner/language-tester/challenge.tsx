// src/app/language-learner/language-tester/challenge.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ChallengeTab } from "@/features/language-tester/components/ChallengeTab";

export default function LanguageTesterChallengeRoute() {
  return (
    <ToolScreen title="Translation Challenge">
      <ChallengeTab />
    </ToolScreen>
  );
}
