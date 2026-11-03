import { redirect } from "next/navigation";

export default function MotivationQuoteRedirectPage() {
  redirect("/learning/motivation?tool=quote");
}