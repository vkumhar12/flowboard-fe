import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from "date-fns";

import type { TaskPriority } from "../types/task";

type ClassValue = string | false | null | undefined | ClassValue[];

/** Tiny classnames joiner (no extra deps). */
export const cn = (...args: ClassValue[]): string => args.flat().filter(Boolean).join(" ");

export const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "var(--color-priority-low)" },
  { value: "medium", label: "Medium", color: "var(--color-priority-medium)" },
  { value: "high", label: "High", color: "var(--color-priority-high)" },
  { value: "urgent", label: "Urgent", color: "var(--color-priority-urgent)" },
];

export const priorityMeta = (value?: string) =>
  PRIORITIES.find((p) => p.value === value) || PRIORITIES[1];

// Accents assigned to columns by index (Linear/Notion-style boards).
// Each entry references a CSS custom property (not a literal hex) so the
// same array automatically re-themes under [data-theme="dark"] — see the
// --column-accent-* declarations in index.css.
const COLUMN_ACCENTS = [
  { dot: "var(--column-accent-1-dot)", soft: "var(--column-accent-1-soft)", ring: "var(--column-accent-1-ring)" }, // electric blue
  { dot: "var(--column-accent-2-dot)", soft: "var(--column-accent-2-soft)", ring: "var(--column-accent-2-ring)" }, // rose
  { dot: "var(--column-accent-3-dot)", soft: "var(--column-accent-3-soft)", ring: "var(--column-accent-3-ring)" }, // amber
  { dot: "var(--column-accent-4-dot)", soft: "var(--column-accent-4-soft)", ring: "var(--column-accent-4-ring)" }, // cyan
  { dot: "var(--column-accent-5-dot)", soft: "var(--column-accent-5-soft)", ring: "var(--column-accent-5-ring)" }, // violet
  { dot: "var(--column-accent-6-dot)", soft: "var(--column-accent-6-soft)", ring: "var(--column-accent-6-ring)" }, // emerald
  { dot: "var(--column-accent-7-dot)", soft: "var(--column-accent-7-soft)", ring: "var(--column-accent-7-ring)" }, // coral
];

export const columnAccent = (index = 0) =>
  COLUMN_ACCENTS[((index % COLUMN_ACCENTS.length) + COLUMN_ACCENTS.length) % COLUMN_ACCENTS.length];

export const initials = (name = ""): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

/** Deterministic avatar color from a string id — vivid palette to match the electric theme.
 *  References CSS custom properties (see --avatar-* in index.css) so avatars re-theme in dark mode. */
export const colorFromId = (id = ""): string => {
  const palette = [
    "var(--avatar-1)", "var(--avatar-2)", "var(--avatar-3)", "var(--avatar-4)",
    "var(--avatar-5)", "var(--avatar-6)", "var(--avatar-7)", "var(--avatar-8)",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

export const relativeTime = (date?: string | null): string => {
  if (!date) return "";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
};

export const formatDueDate = (date?: string | null): { label: string; overdue: boolean } | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return { label: "Today", overdue: false };
  if (isTomorrow(d)) return { label: "Tomorrow", overdue: false };
  return { label: format(d, "MMM d"), overdue: isPast(d) };
};

export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong";

// Position for appending a task to the end of a column (same gap-of-1000
// scheme as column/task creation elsewhere in the app) — used when bulk-
// moving selected tasks into a column (see KanbanBoard.tsx's bulkMove).
export const nextPositionInColumn = (tasksInColumn: { position: number }[]): number =>
  tasksInColumn.length ? Math.max(...tasksInColumn.map((t) => t.position)) + 1000 : 1000;
