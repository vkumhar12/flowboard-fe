import { type TaskPriority } from "../types/task";

export const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "var(--color-priority-low)" },
  { value: "medium", label: "Medium", color: "var(--color-priority-medium)" },
  { value: "high", label: "High", color: "var(--color-priority-high)" },
  { value: "urgent", label: "Urgent", color: "var(--color-priority-urgent)" },
];

export const priorityMeta = (value?: string) =>
  PRIORITIES.find((p) => p.value === value) || PRIORITIES[1];
