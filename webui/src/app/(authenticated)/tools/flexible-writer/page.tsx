import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { FlexibleWriterPage } from "@/features/tools/flexible-writer/components/pages/FlexibleWriterPage";

export const metadata: Metadata = {
  title: "Flexible Writer | Tools",
  description: "Adopt any persona or rule set and transform your input data however you ask.",
};

export default function FlexibleWriterRoutePage() {
  return (
    <>
      <SetPageTitle title="Flexible Writer" />
      <FlexibleWriterPage />
    </>
  );
}
