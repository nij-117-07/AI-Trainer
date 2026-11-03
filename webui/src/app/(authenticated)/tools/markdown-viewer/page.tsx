import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { MarkdownViewerPage } from "@/features/tools/markdown-viewer/components/pages/MarkdownViewerPage";

export const metadata: Metadata = {
  title: "Markdown Viewer | Tools",
  description: "Edit Markdown and instantly preview the rendered output.",
};

export default function MarkdownViewerRoutePage() {
  return (
    <>
      <SetPageTitle title="Markdown Viewer" />
      <MarkdownViewerPage />
    </>
  );
}