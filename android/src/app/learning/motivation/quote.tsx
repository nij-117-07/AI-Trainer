// src/app/learning/motivation/quote.tsx
import { QuoteTab } from "@/features/motivation/components/QuoteTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function QuoteRoute() {
  return (
    <ToolScreen title="Motivational Quote">
      <QuoteTab />
    </ToolScreen>
  );
}
