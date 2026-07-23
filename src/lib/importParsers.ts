import { parseCsv } from "./csv";

export interface ParsedImportSource {
  headers: string[];
  rows: Record<string, string>[];
}

// Jira's standard CSV export is just... CSV — there's no separate Jira
// parser, "Jira import" reuses this with smarter default field-name guesses
// (see guessFieldMapping below) rather than a dedicated code path.
export const parseCsvSource = (text: string): ParsedImportSource => {
  const table = parseCsv(text);
  if (table.length === 0) return { headers: [], rows: [] };

  const [headerRow, ...dataRows] = table;
  const headers = headerRow.map((h) => h.trim());
  const rows = dataRows
    .filter((r) => r.some((cell) => cell.trim() !== ""))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));

  return { headers, rows };
};

// Trello's board-export JSON: `lists` (columns) and `cards` (tasks), each
// card pointing at its list via idList. Normalized into the same
// { headers, rows } shape as CSV so the mapping screen has one code path
// regardless of source, just with fixed canonical header names instead of
// arbitrary CSV column names.
export const parseTrelloSource = (json: string): ParsedImportSource => {
  const data = JSON.parse(json);
  const lists: { id: string; name: string; closed?: boolean }[] = data.lists || [];
  const cards: { name?: string; desc?: string; idList?: string; due?: string | null; closed?: boolean }[] =
    data.cards || [];

  const listNameById = new Map(lists.filter((l) => !l.closed).map((l) => [l.id, l.name]));

  const headers = ["Title", "Description", "Status", "Due Date"];
  const rows = cards
    .filter((c) => !c.closed && c.idList && listNameById.has(c.idList))
    .map((c) => ({
      Title: String(c.name || "").trim(),
      Description: String(c.desc || "").trim(),
      Status: listNameById.get(c.idList!) || "",
      "Due Date": c.due ? String(c.due).slice(0, 10) : "",
    }))
    .filter((r) => r.Title);

  return { headers, rows };
};

export type ImportField = "title" | "description" | "status" | "priority" | "due_date";

const FIELD_ALIASES: Record<ImportField, string[]> = {
  title: ["title", "summary", "name", "task", "issue"],
  description: ["description", "desc", "details", "notes"],
  status: ["status", "state", "list", "column"],
  priority: ["priority"],
  due_date: ["due date", "due", "duedate", "deadline", "target date"],
};

// Case-insensitive best-guess mapping from a header list to this app's
// fields, so the mapping screen opens pre-filled instead of every dropdown
// starting on "None". Works the same for a plain CSV and a Jira CSV export —
// Jira's own headers ("Summary", "Issue Type", ...) are just more aliases.
export const guessFieldMapping = (headers: string[]): Record<ImportField, string | null> => {
  const mapping = {} as Record<ImportField, string | null>;
  for (const field of Object.keys(FIELD_ALIASES) as ImportField[]) {
    const match = headers.find((h) => FIELD_ALIASES[field].includes(h.trim().toLowerCase()));
    mapping[field] = match ?? null;
  }
  return mapping;
};

export const normalizeImportDate = (raw: string | undefined): string | null => {
  if (!raw?.trim()) return null;
  const d = new Date(raw.trim());
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const PRIORITY_ALIASES: Record<string, "low" | "medium" | "high" | "urgent"> = {
  low: "low", lowest: "low", minor: "low", p4: "low", p3: "low", trivial: "low",
  medium: "medium", normal: "medium", p2: "medium",
  high: "high", major: "high", p1: "high",
  urgent: "urgent", critical: "urgent", blocker: "urgent", highest: "urgent", p0: "urgent",
};

export const normalizeImportPriority = (raw: string | undefined): "low" | "medium" | "high" | "urgent" =>
  PRIORITY_ALIASES[(raw || "").trim().toLowerCase()] ?? "medium";
