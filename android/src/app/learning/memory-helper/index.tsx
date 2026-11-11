// src/app/learning/memory-helper/index.tsx
import { useState } from "react";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  MemoryHelperFooter,
  MemoryHelperForm,
  MemoryHelperResultFooter,
  MemoryHelperResults,
} from "@/features/memory-helper/components/MemoryHelperTab";
import { useMemoryHelper } from "@/features/memory-helper/hooks/useMemoryHelper";
import type { MemoryResult } from "@/features/memory-helper/lib/types";

export default function MemoryHelperRoute() {
  const state = useMemoryHelper();
  const [replaced, setReplaced] = useState<MemoryResult | null>(null);
  const showResult = state.result !== null && state.result !== replaced;

  return (
    <ToolScreen
      title="Memory Helper"
      headerRight={<ResetButton onPress={state.reset} accessibilityLabel="Reset memory helper" />}
      footer={
        showResult ? (
          <MemoryHelperResultFooter onNew={() => setReplaced(state.result)} />
        ) : (
          <MemoryHelperFooter state={state} />
        )
      }
    >
      {showResult ? <MemoryHelperResults state={state} /> : <MemoryHelperForm state={state} />}
    </ToolScreen>
  );
}
