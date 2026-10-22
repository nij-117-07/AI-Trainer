import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SuggestTopicsPage } from "@/features/learning/guides/components/pages/SuggestTopicsPage";

export const metadata: Metadata = {
  title: "Topic Suggestions | Learning",
  description: "Get next-topic recommendations that build on what you already know.",
};

export default function SuggestTopicsRoutePage() {
  return (
    <>
      <SetPageTitle title="Topic Suggestions" />
      <SuggestTopicsPage />
    </>
  );
}
