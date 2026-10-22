import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { RewriterPage } from "@/features/linguistic/rewriter/components/pages/RewriterPage";

export const metadata: Metadata = {
  title: "Rewriter | Linguistic",
  description: "Rewrite text to improve quality, adjust tone, or change structure while preserving intent.",
};

export default function RewriterRoutePage() {
  return (
    <>
      <SetPageTitle title="Rewriter" />
      <RewriterPage />
    </>
  );
}
