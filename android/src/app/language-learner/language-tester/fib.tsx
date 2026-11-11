// src/app/language-learner/language-tester/fib.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { FibTab } from "@/features/language-tester/components/FibTab";

export default function LanguageTesterFibRoute() {
  return (
    <ToolScreen title="Fill in the Blank" wide>
      <FibTab />
    </ToolScreen>
  );
}
