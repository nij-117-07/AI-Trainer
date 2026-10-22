import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { InterviewPage } from "@/features/practice/interview/components/pages/InterviewPage";

export const metadata: Metadata = {
  title: "Interview Simulator | Practice",
  description:
    "Run a gated mock interview: session manager, question generator, answer review and progress tracking — you approve every step.",
};

export default function InterviewRoutePage() {
  return (
    <>
      <SetPageTitle title="Interview Simulator" />
      <InterviewPage />
    </>
  );
}
