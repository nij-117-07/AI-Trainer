import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { MemoryHelperPage } from "@/features/learning/memory-helper/components/pages/MemoryHelperPage";

export const metadata: Metadata = {
  title: "Memory Mnemonics | Learning",
  description: "Transform complex data into structured mnemonics and a retention plan.",
};

export default function MemoryHelperRoutePage() {
  return (
    <>
      <SetPageTitle title="Memory Mnemonics" />
      <MemoryHelperPage />
    </>
  );
}
