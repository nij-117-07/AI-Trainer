import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Button asChild variant="default">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
