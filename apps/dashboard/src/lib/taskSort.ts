import { PRIORITIES } from "./utils";
import { type Task } from "@flowboard/shared";

export type SortKey = "due_date" | "priority" | "title" | "created_at" | "updated_at";
export type SortDirection = "asc" | "desc";

export interface SortOption {
  key: SortKey;
  direction: SortDirection;
  label: string;
}

// Every key gets both directions ("where applicable" turned out to mean
// "always" once written out — there's no key here where one direction
// wouldn't make sense).
export const SORT_OPTIONS: SortOption[] = [
  { key: "due_date", direction: "asc", label: "Due date (earliest first)" },
  { key: "due_date", direction: "desc", label: "Due date (latest first)" },
  { key: "priority", direction: "desc", label: "Priority (urgent → low)" },
  { key: "priority", direction: "asc", label: "Priority (low → urgent)" },
  { key: "title", direction: "asc", label: "Title (A–Z)" },
  { key: "title", direction: "desc", label: "Title (Z–A)" },
  { key: "created_at", direction: "desc", label: "Recently created" },
  { key: "created_at", direction: "asc", label: "Oldest created first" },
  { key: "updated_at", direction: "desc", label: "Recently updated" },
  { key: "updated_at", direction: "asc", label: "Oldest updated first" },
];

const priorityRank = (task: Task): number => PRIORITIES.findIndex((p) => p.value === task.priority);

// Tasks with no due date sink to the bottom regardless of direction —
// there's no sensible position for "no date" within an earliest/latest order.
const compare = (a: Task, b: Task, key: SortKey): number => {
  switch (key) {
    case "due_date": {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    case "priority":
      return priorityRank(a) - priorityRank(b);
    case "title":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    case "created_at":
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    case "updated_at":
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
  }
};

export const sortTasks = (tasks: Task[], key: SortKey, direction: SortDirection): Task[] => {
  const sign = direction === "asc" ? 1 : -1;
  return [...tasks].sort((a, b) => sign * compare(a, b, key));
};
