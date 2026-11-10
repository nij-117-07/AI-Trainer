// src/features/motivation/components/MotivationTool.tsx
/** Motivation & Reflection body: tab switcher at the top, with the active tab's results below it. */
import { ChoiceChips } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { QuoteResults, type QuoteTabState } from "./QuoteTab";
import { ReflectResults, type ReflectTabState } from "./ReflectTab";

export type MotivationTab = "quote" | "reflect";

const TAB_OPTIONS: { value: MotivationTab; label: string }[] = [
  { value: "quote", label: "Quote" },
  { value: "reflect", label: "Reflection" },
];

interface MotivationToolProps {
  tab: MotivationTab;
  onTabChange: (tab: MotivationTab) => void;
  quote: QuoteTabState;
  reflect: ReflectTabState;
}

export function MotivationTool({ tab, onTabChange, quote, reflect }: MotivationToolProps) {
  return (
    <Section>
      <ChoiceChips options={TAB_OPTIONS} value={tab} onChange={onTabChange} wrap={false} />
      {tab === "quote" ? <QuoteResults state={quote} /> : <ReflectResults state={reflect} />}
    </Section>
  );
}
