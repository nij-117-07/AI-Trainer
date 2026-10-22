import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { TestingPortalPage } from "@/features/practice/testing-portal/components/pages/TestingPortalPage";

export const metadata: Metadata = {
  title: "Testing Portal | Practice",
  description: "Generate MCQs and theoretical questions, get expert answers, and analyze existing questions.",
};

export default function TestingPortalRoutePage() {
  return (
    <>
      <SetPageTitle title="Testing Portal" />
      <TestingPortalPage />
    </>
  );
}
