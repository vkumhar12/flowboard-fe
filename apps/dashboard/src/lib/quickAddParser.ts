import { addDays, nextDay, type Day } from "date-fns";
import type { TaskPriority } from "@flowboard/shared";

export interface QuickAddMember {
  id: string;
  name: string;
}

export interface ParsedQuickAdd {
  title: string;
  due_date: string | null;
  assignee_id: string | null;
  priority: TaskPriority | null;
}

const PRIORITY_MAP: Record<string, TaskPriority> = {
  "1": "urgent",
  "2": "high",
  "3": "medium",
  "4": "low",
};

const WEEKDAYS: Record<string, Day> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

const toIsoDate = (d: Date): string => d.toISOString().slice(0, 10);

// Resolves "today" | "tomorrow" | "next <weekday>" | "in N days" to an ISO
// date. Returns null for anything it doesn't recognize, so callers can
// leave the original phrase in the title instead of silently dropping it.
export const resolveDatePhrase = (phrase: string, now: Date): string | null => {
  const p = phrase.trim().toLowerCase();
  if (p === "today") return toIsoDate(now);
  if (p === "tomorrow") return toIsoDate(addDays(now, 1));

  const nextMatch = p.match(/^next\s+(\w+)$/);
  if (nextMatch) {
    const day = WEEKDAYS[nextMatch[1]];
    if (day === undefined) return null;
    return toIsoDate(nextDay(now, day));
  }

  const inDaysMatch = p.match(/^in\s+(\d+)\s+days?$/);
  if (inDaysMatch) {
    return toIsoDate(addDays(now, Number(inDaysMatch[1])));
  }

  return null;
};

// Parses a single free-text quick-add line into task fields. Pure and
// React-free so it can be exercised directly with plain input/output pairs.
// Each token type is stripped from the working title only once it's been
// successfully resolved — an unrecognized "by <phrase>" is left in the
// title rather than silently discarded, so the user can see what wasn't
// understood instead of losing it.
export const parseQuickAddInput = (
  raw: string,
  members: QuickAddMember[],
  now: Date = new Date()
): ParsedQuickAdd => {
  let title = raw;
  let priority: TaskPriority | null = null;
  let assignee_id: string | null = null;
  let due_date: string | null = null;

  title = title.replace(/#\S+/g, "").trim();

  // Negative lookbehind excludes "@P2"-style mention text from matching as
  // a priority token, so it's left intact for the assignee regex below.
  title = title.replace(/(?<!@)\bP([1-4])\b/i, (_match, level: string) => {
    priority = PRIORITY_MAP[level];
    return "";
  });

  const atMatch = title.match(/@(\S+)/);
  if (atMatch) {
    const handle = atMatch[1].toLowerCase();
    const member = members.find((m) => m.name.toLowerCase().includes(handle));
    if (member) {
      assignee_id = member.id;
      title = title.replace(atMatch[0], "");
    }
  }

  const dateMatch = title.match(/\b(?:by|on)\s+(today|tomorrow|next\s+\w+|in\s+\d+\s+days?)\b/i);
  if (dateMatch) {
    const resolved = resolveDatePhrase(dateMatch[1], now);
    if (resolved) {
      due_date = resolved;
      title = title.replace(dateMatch[0], "");
    }
  }

  title = title.replace(/\s{2,}/g, " ").trim();

  return { title, due_date, assignee_id, priority };
};
