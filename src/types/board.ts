import type { User } from "./user";
import type { Column } from "./column";
import type { Task } from "./task";

export type BoardRole = "owner" | "admin" | "member";

// A board row from the `boards` table.
export interface Board {
  id: string;
  title: string;
  description: string | null;
  color: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// What GET /boards returns for each board: the row plus counts computed
// with SQL COUNT(*), which the Postgres driver returns as strings, not
// numbers (existing FE code already does Number(b.task_count) everywhere).
export interface BoardListItem extends Board {
  is_owner: boolean;
  is_favorite: boolean;
  task_count: string;
  member_count: string;
}

// A user's membership on a board (users table row + their role on this board).
export interface BoardMember extends User {
  role: BoardRole;
  joined_at: string;
}

// The full payload for GET /boards/:boardId.
export interface BoardDetail {
  board: Board;
  columns: Column[];
  tasks: Task[];
  members: BoardMember[];
  role: BoardRole;
}

export interface CreateBoardInput {
  title: string;
  description?: string | null;
  color?: string;
}

export interface UpdateBoardInput {
  title?: string;
  description?: string | null;
  color?: string;
}

export interface AddMemberInput {
  email: string;
  role?: "admin" | "member";
}
