// src/features/motivation/components/MotivationTool.tsx
/** Motivation & Reflection body: view switcher at the top, with the active view's results and options below it. */
import { Section } from "@/components/tool/Section";
import { QuoteForm, QuoteResults, type QuoteTabState } from "./QuoteTab";
import { ReflectForm, ReflectResults, type ReflectTabState } from "./ReflectTab";
import { ViewSegments } from "./ViewSegments";

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
      <ViewSegments label="Motivation view" options={TAB_OPTIONS} value={tab} onChange={onTabChange} />
      {tab === "quote" ? (
        <>
          <QuoteResults state={quote} />
          <QuoteForm state={quote} />
        </>
      ) : (
        <>
          <ReflectResults state={reflect} />
          <ReflectForm state={reflect} />
        </>
      )}
    </Section>
  );
}
