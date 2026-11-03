import { redirect } from "next/navigation";

interface TutorChatRedirectPageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function TutorChatRedirectPage({
  searchParams,
}: TutorChatRedirectPageProps) {
  const params = await searchParams;
  const target = params?.session
    ? `/learning/tutor?tool=chat&session=${encodeURIComponent(params.session)}`
    : "/learning/tutor?tool=chat";
  redirect(target);
}