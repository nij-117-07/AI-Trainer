// src/app/learning/motivation/index.tsx
import { useState } from "react";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { MotivationTool, type MotivationTab } from "@/features/motivation/components/MotivationTool";
import { QuoteForm, useQuoteTab } from "@/features/motivation/components/QuoteTab";
import { ReflectForm, useReflectTab } from "@/features/motivation/components/ReflectTab";

export default function MotivationRoute() {
  const [tab, setTab] = useState<MotivationTab>("quote");
  const quote = useQuoteTab();
  const reflect = useReflectTab();
  const active = tab === "quote" ? quote : reflect;

  return (
    <ToolScreen
      title="Motivation & Reflection"
      headerRight={<ResetButton onPress={active.reset} />}
      footer={tab === "quote" ? <QuoteForm state={quote} /> : <ReflectForm state={reflect} />}
    >
      <MotivationTool tab={tab} onTabChange={setTab} quote={quote} reflect={reflect} />
    </ToolScreen>
  );
}
