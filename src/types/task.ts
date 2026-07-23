export type TaskPriority = "low" | "medium" | "high" | "urgent";

// A task row from the `tasks` table, left-joined with its assignee's
// name/email/avatar (the backend does this join so the FE never has to).
export interface Task {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignee_name: string | null;
  assignee_email: string | null;
  assignee_avatar: string | null;
}

// A task as returned by useWorkspace(), which flattens tasks across every
// board the user can see and tags each with where it lives.
export interface WorkspaceTask extends Task {
  board_title: string;
  board_color: string;
  status: string;
}

export interface CreateTaskInput {
  column_id: string;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
}

export interface MoveTaskInput {
  column_id: string;
  position: number;
}

export interface TaskListFilters {
  priority?: TaskPriority;
  assignee?: string;
  column?: string;
  q?: string;
}
