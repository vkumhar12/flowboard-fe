import type { Task, TaskPriority } from "./task";

// A single AI-drafted task/subtask, before it has been saved (no id yet).
export interface AISuggestion {
  title: string;
  description: string;
  priority: TaskPriority;
}

export interface AISummary {
  headline: string;
  completed: string[];
  inProgress: string[];
  risks: string[];
  recommendations: string[];
}

export interface GenerateTasksInput {
  goal: string;
  count?: number;
  // When present, the backend persists the suggestions as real tasks in
  // this column instead of just returning them for preview.
  column_id?: string;
}

export interface BreakdownTaskInput {
  // Either taskId (load title/description from an existing task) or
  // title/description directly must be provided.
  taskId?: string;
  title?: string;
  description?: string;
  count?: number;
}

// generate-tasks returns bare suggestions when no column_id was given
// (preview only), or full saved Task rows when the backend persisted them.
export interface GenerateTasksResponse {
  tasks: AISuggestion[] | Task[];
  persisted: boolean;
}
