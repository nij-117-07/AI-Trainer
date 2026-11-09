/** Prompt Generator page: a Prompt Refiner section and a System Prompt Generator/Refiner section. */
import { useState } from "react";
import { ChoiceChips } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { PromptRefinerTool } from "@/features/prompt-refiner/components/PromptRefinerTool";
import { PromptGeneratorTool } from "./PromptGeneratorTool";

type PromptSection = "refiner" | "system";

const SECTION_OPTIONS: { value: PromptSection; label: string }[] = [
  { value: "refiner", label: "Prompt Refiner" },
  { value: "system", label: "System Prompt" },
];

export function PromptToolsHub() {
  const [section, setSection] = useState<PromptSection>("refiner");

  return (
    <Section>
      <ChoiceChips options={SECTION_OPTIONS} value={section} onChange={setSection} wrap={false} />
      {section === "refiner" ? <PromptRefinerTool /> : <PromptGeneratorTool />}
    </Section>
  );
}
