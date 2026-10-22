import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ResourceSuggestorPage } from "@/features/learning/resource-suggestor/components/pages/ResourceSuggestorPage";

export const metadata: Metadata = {
  title: "Resource Suggestor | Learning",
  description: "Get personalized learning resources, a path summary, and next steps based on your background and goals.",
};

export default function ResourceSuggestorRoutePage() {
  return (
    <>
      <SetPageTitle title="Resource Suggestor" />
      <ResourceSuggestorPage />
    </>
  );
}
