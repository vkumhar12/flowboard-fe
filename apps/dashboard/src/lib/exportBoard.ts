import { toCsv } from "./csv";
import { type Board, type Column, type Task } from "@flowboard/shared";

export const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const downloadFile = (filename: string, content: string, mime: string): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const CSV_HEADERS = ["Title", "Description", "Status", "Priority", "Assignee", "Due Date", "Created At", "Updated At"];

// One row per task — "Status" is the task's column title, since that's what
// a column represents (there's no separate status field on a task).
export const boardToCsv = (columns: Column[], tasks: Task[]): string => {
  const columnTitleById = new Map(columns.map((c) => [c.id, c.title]));
  const rows = tasks.map((t) => [
    t.title,
    t.description || "",
    columnTitleById.get(t.column_id) || "",
    t.priority,
    t.assignee_name || "",
    t.due_date ? t.due_date.slice(0, 10) : "",
    t.created_at,
    t.updated_at,
  ]);
  return toCsv([CSV_HEADERS, ...rows]);
};

// Richer/nested, unlike the flat CSV — includes board metadata and columns
// (with their order preserved) alongside every task.
export const boardToJson = (board: Board, columns: Column[], tasks: Task[]): string => {
  const columnTitleById = new Map(columns.map((c) => [c.id, c.title]));
  const orderedColumns = [...columns].sort((a, b) => a.position - b.position);

  return JSON.stringify(
    {
      board: { title: board.title, description: board.description, color: board.color },
      columns: orderedColumns.map((c) => ({ title: c.title })),
      tasks: tasks.map((t) => ({
        title: t.title,
        description: t.description,
        status: columnTitleById.get(t.column_id) || "",
        priority: t.priority,
        due_date: t.due_date,
        assignee_name: t.assignee_name,
        assignee_email: t.assignee_email,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })),
    },
    null,
    2
  );
};
