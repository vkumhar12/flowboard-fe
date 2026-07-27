import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { priorityMeta } from "../../lib/priority";

interface PriorityBadgeProps {
  priority?: string;
  className?: string;
}

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const meta = priorityMeta(priority);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight",
        className
      )}
      style={{ color: meta.color, backgroundColor: `color-mix(in oklab, ${meta.color} 9%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
};

// Uppercase label-style pill (used as the card's top tag, like a category).
export const PriorityTag = ({ priority, className }: PriorityBadgeProps) => {
  const meta = priorityMeta(priority);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
        className
      )}
      style={{ color: meta.color, backgroundColor: `color-mix(in oklab, ${meta.color} 8%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
};

export interface BadgeProps {
  children?: ReactNode;
  className?: string;
}

export const Badge = ({ children, className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium tracking-tight text-muted",
      className
    )}
  >
    {children}
  </span>
);
