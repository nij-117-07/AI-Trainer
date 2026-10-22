import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ChartsPage } from "@/features/tools/charts/components/pages/ChartsPage";

export const metadata: Metadata = {
  title: "Chart.js Generator | Tools",
  description: "Generate a Chart.js HTML/JS visualization from raw data and style instructions.",
};

export default function ChartsRoutePage() {
  return (
    <>
      <SetPageTitle title="Chart.js Generator" />
      <ChartsPage />
    </>
  );
}
