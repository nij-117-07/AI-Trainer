// src/app/language-learner/language-tester/fib.tsx
import { FibScreen } from "@/features/language-tester/components/FibScreen";
import { useFibSetup } from "@/features/language-tester/components/FibPractice";

export default function LanguageTesterFibRoute() {
  const setup = useFibSetup();
  return <FibScreen setup={setup} />;
}
