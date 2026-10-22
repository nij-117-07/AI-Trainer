import type { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { RssManagerPage } from "@/features/tools/rss/components/manager/RssManagerPage";

export const metadata: Metadata = {
  title: "RSS Feed Manager | Tools",
  description: "Configure the RSS and Atom feed providers that power the RSS viewer.",
};

export default function RssManagerRoutePage() {
  return (
    <>
      <SetPageTitle title="RSS Manager" />
      <RssManagerPage />
    </>
  );
}
