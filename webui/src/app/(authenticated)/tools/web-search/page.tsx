import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { WebSearchPage } from "@/features/tools/web-search/components/WebSearchPage";

export const metadata: Metadata = {
  title: "Web Search | Tools",
  description:
    "Search the web with DuckDuckGo — no API key needed — and get clean page links, titles, and snippets.",
};

export default function WebSearchRoutePage() {
  return (
    <>
      <SetPageTitle title="Web Search" />
      <WebSearchPage />
    </>
  );
}
