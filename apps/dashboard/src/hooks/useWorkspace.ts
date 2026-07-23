import { useQueries } from "@tanstack/react-query";
import { boardApi } from "@/services";
import { useBoards } from "../context/BoardsContext";
import { queryKeys } from "../lib/queryKeys";
import { type WorkspaceTask, type BoardMember } from "@flowboard/shared";

export interface WorkspaceMember extends BoardMember {
  boards: string[];
}

/**
 * Aggregates every board the user can see into a single flat list of tasks
 * (each tagged with its board + status) and a de-duplicated member directory.
 *
 * Each board is its own useQueries entry, keyed identically to useBoard.ts's
 * single-board query (queryKeys.boards.detail(id)) — so a board already
 * opened via the Kanban board page is already warm in cache here, and vice
 * versa, instead of each view fetching the same board separately.
 */
export const useWorkspace = () => {
  const { boards, loading: boardsLoading } = useBoards();

  const boardQueries = useQueries({
    queries: boards.map((b) => ({
      queryKey: queryKeys.boards.detail(b.id),
      queryFn: () => boardApi.get(b.id),
    })),
  });

  const loading = boardsLoading || boardQueries.some((q) => q.isLoading);

  const tasks: WorkspaceTask[] = [];
  const memberMap = new Map<string, WorkspaceMember>();

  boardQueries.forEach((q, i) => {
    const res = q.data;
    const boardMeta = boards[i];
    if (!res || !boardMeta) return; // still loading, or this board's fetch failed — skip, matching the old Promise.all(...).catch(() => null) behavior

    const board = res.board || boardMeta;
    const colTitle: Record<string, string> = {};
    (res.columns || []).forEach((c) => {
      colTitle[c.id] = c.title;
    });

    (res.tasks || []).forEach((t) =>
      tasks.push({
        ...t,
        board_id: board.id,
        board_title: board.title,
        board_color: board.color,
        status: colTitle[t.column_id] || "",
      })
    );

    (res.members || []).forEach((m) => {
      const existing = memberMap.get(m.id);
      if (existing) {
        if (!existing.boards.includes(board.title)) existing.boards.push(board.title);
      } else {
        memberMap.set(m.id, { ...m, boards: [board.title] });
      }
    });
  });

  return { tasks, members: [...memberMap.values()], boards, loading };
};
