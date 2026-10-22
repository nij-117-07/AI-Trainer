import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { AiDetectorPage } from "@/features/tools/ai-detector/components/pages/AiDetectorPage";

export const metadata: Metadata = {
  title: "AI Detector | Tools",
  description:
    "Detect AI-written text, humanize it, then re-detect to verify — each step runs on click.",
};

export default function AiDetectorRoutePage() {
  return (
    <>
      <SetPageTitle title="AI Detector" />
      <AiDetectorPage />
    </>
  );
}
