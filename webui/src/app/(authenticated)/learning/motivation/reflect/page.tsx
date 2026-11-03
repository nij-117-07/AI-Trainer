import { redirect } from "next/navigation";

export default function ReflectionRedirectPage() {
  redirect("/learning/motivation?tool=reflect");
}