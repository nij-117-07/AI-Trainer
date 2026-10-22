import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { GraderPage } from "@/features/practice/grader/components/pages/GraderPage";

export const metadata: Metadata = {
  title: "Performance Grader | Practice",
  description: "Grade a text or image answer against a target objective with a score and constructive feedback.",
};

export default function GraderRoutePage() {
  return (
    <>
      <SetPageTitle title="Performance Grader" />
      <GraderPage />
    </>
  );
}
