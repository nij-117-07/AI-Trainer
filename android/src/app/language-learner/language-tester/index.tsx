// src/app/language-learner/language-tester/index.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { AssessmentTab } from "@/features/language-tester/components/AssessmentTab";
import { LanguageTesterLinks } from "@/features/language-tester/components/LanguageTesterLinks";

export default function LanguageTesterRoute() {
  return (
    <ToolScreen title="Language Tester" wide>
      <LanguageTesterLinks />
      <AssessmentTab />
    </ToolScreen>
  );
}
