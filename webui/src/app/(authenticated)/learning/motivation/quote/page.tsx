import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { MotivationQuotePage } from "@/features/learning/motivation/components/pages/MotivationQuotePage";

export const metadata: Metadata = {
  title: "Motivational Quote | Learning",
  description: "Get a personalized motivational quote matched to your emotional state.",
};

export default function MotivationQuoteRoutePage() {
  return (
    <>
      <SetPageTitle title="Motivational Quote" />
      <MotivationQuotePage />
    </>
  );
}
