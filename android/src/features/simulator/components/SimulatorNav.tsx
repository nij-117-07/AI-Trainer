// src/features/simulator/components/SimulatorNav.tsx
/** Menu row linking the three Simulator pages. The current page is selected; the others replace the screen. */
import { useRouter } from "expo-router";
import { ChoiceChips } from "@/components/tool/FormControls";

export type SimulatorPage = "run" | "chat" | "prompts";

const PAGES: { value: SimulatorPage; label: string; route: string }[] = [
  { value: "run", label: "Run", route: "/language-learner/simulator" },
  { value: "chat", label: "Chat", route: "/language-learner/simulator/chat" },
  { value: "prompts", label: "Prompts", route: "/language-learner/simulator/prompts" },
];

export function SimulatorNav({ current }: { current: SimulatorPage }) {
  const router = useRouter();

  function open(page: SimulatorPage) {
    const target = PAGES.find((item) => item.value === page);
    if (target && page !== current) router.replace(target.route as never);
  }

  return <ChoiceChips options={PAGES} value={current} onChange={open} wrap={false} />;
}
