import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { getRoadmapAction } from "@/features/learning/roadmap/actions/crud";
import { RoadmapDetailPage } from "@/features/learning/roadmap/components/RoadmapDetailPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RoadmapDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: RoadmapDetailProps): Promise<Metadata> {
  const { id } = await params;
  const roadmap = await getRoadmapAction(id);
  return {
    title: roadmap ? `${roadmap.subject} | Learning Roadmap` : "Learning Roadmap",
  };
}

export default async function RoadmapDetail({ params }: RoadmapDetailProps) {
  const { id } = await params;
  const roadmap = await getRoadmapAction(id);
  if (!roadmap) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <SetPageTitle title={roadmap.subject} />
      <RoadmapDetailPage initialRoadmap={roadmap} />
    </div>
  );
}
