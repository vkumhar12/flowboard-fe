// A column row from the `columns` table (e.g. "Todo", "In Progress").
export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface CreateColumnInput {
  title: string;
}

export interface UpdateColumnInput {
  title?: string;
  position?: number;
}
