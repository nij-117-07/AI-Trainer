import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ReflectionPage } from "@/features/learning/motivation/components/pages/ReflectionPage";

export const metadata: Metadata = {
  title: "Reflection Journal | Learning",
  description: "Generate deep journaling prompts and a perspective shift based on your mood and goals.",
};

export default function ReflectionRoutePage() {
  return (
    <>
      <SetPageTitle title="Reflection Journal" />
      <ReflectionPage />
    </>
  );
}
