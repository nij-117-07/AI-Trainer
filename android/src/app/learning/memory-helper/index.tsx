// src/app/learning/memory-helper/index.tsx
import { MemoryHelperTab } from "@/features/memory-helper/components/MemoryHelperTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function MemoryHelperRoute() {
  return (
    <ToolScreen title="Memory Helper">
      <MemoryHelperTab />
    </ToolScreen>
  );
}
