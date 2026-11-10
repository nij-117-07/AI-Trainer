// src/app/learning/memory-helper/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { MemoryHelperFooter, MemoryHelperResults } from "@/features/memory-helper/components/MemoryHelperTab";
import { useMemoryHelper } from "@/features/memory-helper/hooks/useMemoryHelper";

export default function MemoryHelperRoute() {
  const state = useMemoryHelper();

  return (
    <ToolScreen
      title="Memory Helper"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={<MemoryHelperFooter state={state} />}
    >
      <MemoryHelperResults state={state} />
    </ToolScreen>
  );
}
