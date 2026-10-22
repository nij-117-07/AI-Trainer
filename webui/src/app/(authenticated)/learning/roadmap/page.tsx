import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { listRoadmapsAction } from "@/features/learning/roadmap/actions/crud";
import { RoadmapListPage } from "@/features/learning/roadmap/components/RoadmapListPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Learning Roadmap",
  description: "Create and track AI-generated learning roadmaps with main points, subpoints, and progress.",
};

export default async function RoadmapPage() {
  const roadmaps = await listRoadmapsAction();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <SetPageTitle title="Learning Roadmap" />
      <RoadmapListPage initialRoadmaps={roadmaps} />
    </div>
  );
}
