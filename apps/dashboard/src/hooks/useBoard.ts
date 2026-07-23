import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { boardApi, taskApi, columnApi } from "@/services";
import { connectSocket } from "../lib/socket";
import { queryKeys } from "../lib/queryKeys";
import { type Board, type BoardDetail, type Column, type CreateColumnInput, type UpdateColumnInput, type Task, type CreateTaskInput, type UpdateTaskInput, type BoardMember, type PresenceUser } from "@flowboard/shared";

import { errorMessage } from "../lib/utils";

const isValidTask = (t: any): t is Task => {
  return t && typeof t.id === "string" && typeof t.title === "string" && typeof t.column_id === "string";
};

const isValidColumn = (c: any): c is Column => {
  return c && typeof c.id === "string" && typeof c.title === "string" && typeof c.position === "number";
};

const isValidBoard = (b: any): b is Board => {
  return b && typeof b.id === "string" && typeof b.title === "string";
};

const upsertById = <T extends { id: string }>(arr: T[], item: T): T[] => {
  const idx = arr.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...arr, item];
  const next = [...arr];
  next[idx] = item;
  return next;
};

/**
 * Loads a board and keeps it in sync via Socket.IO. Returns board state plus
 * mutation helpers that update optimistically and persist to the API.
 *
 * The board's data (board/columns/tasks/members/role) lives in the TanStack
 * Query cache under queryKeys.boards.detail(boardId) — Socket.IO events and
 * mutations below both write into that same cache entry via
 * queryClient.setQueryData, rather than local component state, so every
 * component reading this board (there's only ever one per boardId, but this
 * is what lets a board revisited from My Tasks show instantly from cache).
 */
export const useBoard = (boardId: string | undefined) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const detailKey = queryKeys.boards.detail(boardId ?? "");

  const [presence, setPresence] = useState<PresenceUser[]>([]);

  // Guards moveTask against a fast double-click/double-toggle firing two
  // overlapping requests for the same task — without this, the slower
  // request's revert-on-error could stomp over the faster one's result.
  const movingTaskIds = useRef(new Set<string>());

  const boardQuery = useQuery({
    queryKey: detailKey,
    queryFn: () => boardApi.get(boardId!),
    enabled: Boolean(boardId),
  });

  const data = boardQuery.data;
  const board = data?.board ?? null;
  const columns = data?.columns ?? [];
  const tasks = data?.tasks ?? [];
  const members = data?.members ?? [];
  const role = data?.role ?? "member";

  const setDetail = (updater: (old: BoardDetail) => BoardDetail) => {
    queryClient.setQueryData(detailKey, (old: BoardDetail | undefined) => (old ? updater(old) : old));
  };

  const setBoard: Dispatch<SetStateAction<Board | null>> = (value) => {
    setDetail((old) => {
      const next = typeof value === "function" ? (value as (p: Board | null) => Board | null)(old.board) : value;
      return next ? { ...old, board: next } : old;
    });
  };

  const setMembers: Dispatch<SetStateAction<BoardMember[]>> = (value) => {
    setDetail((old) => ({
      ...old,
      members: typeof value === "function" ? (value as (p: BoardMember[]) => BoardMember[])(old.members) : value,
    }));
  };

  const upsertTask = (task: Task) => setDetail((old) => ({ ...old, tasks: upsertById(old.tasks, task) }));
  const removeTaskLocal = (id: string) => setDetail((old) => ({ ...old, tasks: old.tasks.filter((t) => t.id !== id) }));

  // De-duped by id (unlike a raw [...old.columns, col] append) — creating a
  // column gets both a direct mutation response *and* a "column:created"
  // socket echo (Socket.IO broadcasts to the whole room, including the
  // sender), so a plain append would add the same column twice.
  const upsertColumn = (column: Column) =>
    setDetail((old) => ({ ...old, columns: upsertById(old.columns, column).sort((a, b) => a.position - b.position) }));

  // Real-time sync
  useEffect(() => {
    if (!boardId) return;
    const socket = connectSocket();
    socket.emit("board:join", boardId);

    const onCreated = (t: Task) => isValidTask(t) && upsertTask(t);
    const onUpdated = (t: Task) => isValidTask(t) && upsertTask(t);
    const onMoved = (t: Task) => isValidTask(t) && upsertTask(t);
    const onDeleted = (data: any) => data && typeof data.id === "string" && removeTaskLocal(data.id);
    const onColCreated = (c: Column) => isValidColumn(c) && upsertColumn(c);
    const onColUpdated = (c: Column) =>
      isValidColumn(c) &&
      setDetail((old) => ({
        ...old,
        columns: old.columns.map((x) => (x.id === c.id ? c : x)).sort((a, b) => a.position - b.position),
      }));
    const onColDeleted = (data: any) =>
      data && typeof data.id === "string" && setDetail((old) => ({ ...old, columns: old.columns.filter((x) => x.id !== data.id) }));
    const onBoardUpdated = (b: Board) => isValidBoard(b) && setBoard(b);
    const onBoardDeleted = ({ id }: { id: string }) => {
      if (id === boardId) {
        toast.error("This board has been deleted");
        navigate("/dashboard");
      }
    };
    const onPresenceSync = ({ users }: { users: PresenceUser[] }) => setPresence(users || []);
    const onPresenceJoin = ({ user }: { user: PresenceUser }) =>
      setPresence((p) => (p.find((u) => u.id === user.id) ? p : [...p, user]));
    const onPresenceLeave = ({ user }: { user: PresenceUser }) => setPresence((p) => p.filter((u) => u.id !== user.id));

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:moved", onMoved);
    socket.on("task:deleted", onDeleted);
    socket.on("column:created", onColCreated);
    socket.on("column:updated", onColUpdated);
    socket.on("column:deleted", onColDeleted);
    socket.on("board:updated", onBoardUpdated);
    socket.on("board:deleted", onBoardDeleted);
    socket.on("presence:sync", onPresenceSync);
    socket.on("presence:join", onPresenceJoin);
    socket.on("presence:leave", onPresenceLeave);

    return () => {
      socket.emit("board:leave", boardId);
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:moved", onMoved);
      socket.off("task:deleted", onDeleted);
      socket.off("column:created", onColCreated);
      socket.off("column:updated", onColUpdated);
      socket.off("column:deleted", onColDeleted);
      socket.off("board:updated", onBoardUpdated);
      socket.off("board:deleted", onBoardDeleted);
      socket.off("presence:sync", onPresenceSync);
      socket.off("presence:join", onPresenceJoin);
      socket.off("presence:leave", onPresenceLeave);
      setPresence([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, navigate]);

  /* ----------------------------- mutations ----------------------------- */

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskInput) => taskApi.create(boardId!, data),
    onSuccess: (task) => upsertTask(task),
    onError: (err) => toast.error(errorMessage(err)),
  });
  // Errors propagate to the caller (matches the original's `throw err`) —
  // e.g. TaskModal keeps itself open on failure instead of closing.
  const createTask = (data: CreateTaskInput) => createTaskMutation.mutateAsync(data);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) => taskApi.update(boardId!, taskId, data),
    onMutate: ({ taskId, data }) => {
      const prev = tasks.find((t) => t.id === taskId);
      if (prev) upsertTask({ ...prev, ...data });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) upsertTask(context.prev);
      toast.error(errorMessage(err));
    },
    onSuccess: (task) => upsertTask(task),
  });
  const updateTask = (taskId: string, data: UpdateTaskInput) => updateTaskMutation.mutateAsync({ taskId, data });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskApi.remove(boardId!, taskId),
    onMutate: (taskId) => {
      const prev = tasks.find((t) => t.id === taskId);
      removeTaskLocal(taskId);
      return { prev };
    },
    onError: (err, _taskId, context) => {
      if (context?.prev) upsertTask(context.prev);
      toast.error(errorMessage(err));
    },
    onSuccess: () => toast.success("Task deleted"),
  });
  // Swallows errors after toasting (matches the original — no rethrow).
  const deleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch {
      // already toasted in onError
    }
  };

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId, position }: { taskId: string; columnId: string; position: number }) =>
      taskApi.move(boardId!, taskId, { column_id: columnId, position }),
    onMutate: ({ taskId, columnId, position }) => {
      const prev = tasks.find((t) => t.id === taskId);
      if (prev) upsertTask({ ...prev, column_id: columnId, position });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) upsertTask(context.prev);
      toast.error(errorMessage(err));
    },
  });
  const moveTask = async (taskId: string, columnId: string, position: number) => {
    if (movingTaskIds.current.has(taskId)) return;
    movingTaskIds.current.add(taskId);
    try {
      await moveTaskMutation.mutateAsync({ taskId, columnId, position });
    } catch {
      // already toasted in onError
    } finally {
      movingTaskIds.current.delete(taskId);
    }
  };

  const addColumnMutation = useMutation({
    mutationFn: (title: string) => columnApi.create(boardId!, { title } satisfies CreateColumnInput),
    onSuccess: (col) => upsertColumn(col),
    onError: (err) => toast.error(errorMessage(err)),
  });
  // Returns the created column (callers that don't need it, like the
  // "add column" prompt dialog, just don't use the return value) — the
  // import feature needs the new column's id right away, to assign rows to
  // it without waiting for a full board refetch.
  const addColumn = (title: string) => addColumnMutation.mutateAsync(title);

  const renameColumnMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      columnApi.update(boardId!, columnId, { title } satisfies UpdateColumnInput),
    onMutate: ({ columnId, title }) => {
      setDetail((old) => ({ ...old, columns: old.columns.map((c) => (c.id === columnId ? { ...c, title } : c)) }));
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  // No revert-on-error here — matches the original renameColumn exactly.
  const renameColumn = async (columnId: string, title: string) => {
    try {
      await renameColumnMutation.mutateAsync({ columnId, title });
    } catch {
      // already toasted in onError
    }
  };

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => columnApi.remove(boardId!, columnId),
    onSuccess: (_result, columnId) =>
      setDetail((old) => ({
        ...old,
        columns: old.columns.filter((c) => c.id !== columnId),
        tasks: old.tasks.filter((t) => t.column_id !== columnId),
      })),
    onError: (err) => toast.error(errorMessage(err)),
  });
  // No optimistic apply, no revert — matches the original deleteColumn exactly.
  const deleteColumn = async (columnId: string) => {
    try {
      await deleteColumnMutation.mutateAsync(columnId);
    } catch {
      // already toasted in onError
    }
  };

  return {
    board, columns, tasks, members, role, presence,
    loading: boardQuery.isLoading,
    error: boardQuery.isError ? errorMessage(boardQuery.error) : null,
    setBoard, setMembers,
    createTask, updateTask, deleteTask, moveTask, upsertTask,
    addColumn, renameColumn, deleteColumn,
  };
};
