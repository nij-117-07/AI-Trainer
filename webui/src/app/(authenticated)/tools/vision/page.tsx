import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { VisionConverterPage } from "@/features/tools/vision-converter/components/pages/VisionConverterPage";

export const metadata: Metadata = {
  title: "Vision Converter | Tools",
  description: "Convert an uploaded image into high-quality, well-structured Markdown.",
};

export default function VisionConverterRoutePage() {
  return (
    <>
      <SetPageTitle title="Vision Converter" />
      <VisionConverterPage />
    </>
  );
}
