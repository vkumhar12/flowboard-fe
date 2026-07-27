import { cn } from "../../lib/utils";

/** Shimmer placeholder. Uses the app's `.skeleton` shimmer treatment (theme.css) rather than shadcn's plain animate-pulse. */
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("skeleton rounded-md", className)} />
);
