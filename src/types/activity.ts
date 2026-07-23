// A row from the `activities` table — an audit-log entry for a board
// (e.g. "Alex created a task", "Maya moved a task to Done").
export interface Activity {
  id: string;
  board_id: string;
  user_id: string | null;
  action: string;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_name: string | null;
  user_avatar: string | null;
}
