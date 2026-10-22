import { Loader2 } from "lucide-react";

export default function AuthenticatedLoading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
