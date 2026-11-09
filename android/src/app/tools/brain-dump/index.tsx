// src/app/tools/brain-dump/index.tsx
import { useState } from "react";
import { BrainDumpComposer } from "@/features/brain-dump/components/BrainDumpComposer";
import { BrainDumpTool } from "@/features/brain-dump/components/BrainDumpTool";
import { useNotes } from "@/features/brain-dump/hooks/useNotes";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function BrainDumpRoute() {
  const store = useNotes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const editing = store.notes.some((note) => note.id === selectedId);

  return (
    <ToolScreen title="Brain Dump & Notes" footer={editing ? null : <BrainDumpComposer store={store} />}>
      <BrainDumpTool store={store} selectedId={selectedId} onSelect={setSelectedId} />
    </ToolScreen>
  );
}
