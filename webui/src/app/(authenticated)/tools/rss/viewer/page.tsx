import type { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { RssViewerPage } from "@/features/tools/rss/components/viewer/RssViewerPage";

export const metadata: Metadata = {
  title: "RSS Viewer | Tools",
  description: "Browse, search, and filter articles from your configured RSS and Atom feeds.",
};

export default function RssViewerRoutePage() {
  return (
    <>
      <SetPageTitle title="RSS Viewer" />
      <RssViewerPage />
    </>
  );
}
