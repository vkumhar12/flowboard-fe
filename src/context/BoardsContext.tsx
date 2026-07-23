import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { boardApi } from "@/services";
import { queryKeys } from "../lib/queryKeys";
import { errorMessage } from "../lib/utils";
import type { Board, BoardListItem, CreateBoardInput, UpdateBoardInput } from "../types/board";

// Favorited boards sort to the top; Array.sort is stable so relative order
// (already updated_at DESC from the API) is preserved within each group.
const sortBoards = (list: BoardListItem[]): BoardListItem[] =>
  [...list].sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite));

const setBoardsCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (prev: BoardListItem[]) => BoardListItem[]
) => {
  queryClient.setQueryData(queryKeys.boards.list, (prev: BoardListItem[] = []) => updater(prev));
};

// No React Context here — the TanStack Query cache is already the shared
// state (see App.tsx's QueryClientProvider), so this is a plain hook every
// component calls independently, all reading/writing the same cache entry.
export const useBoards = () => {
  const queryClient = useQueryClient();

  // Guards toggleFavorite against a fast double-click firing two overlapping
  // requests for the same board — a per-board id set rather than relying on
  // the mutation's own isPending, since one shared mutation instance here
  // covers every board, not just one.
  const pendingFavoriteIds = useRef(new Set<string>());

  const boardsQuery = useQuery({
    queryKey: queryKeys.boards.list,
    queryFn: () => boardApi.list(),
  });

  const boards = boardsQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CreateBoardInput) => boardApi.create(data),
    onSuccess: (board) => {
      setBoardsCache(queryClient, (prev) =>
        sortBoards([
          { ...board, is_owner: true, is_favorite: false, task_count: "0", member_count: "1" },
          ...prev,
        ])
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBoardInput }) => boardApi.update(id, data),
    onSuccess: (board, { id }) => {
      setBoardsCache(queryClient, (prev) => prev.map((b) => (b.id === id ? { ...b, ...board } : b)));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => boardApi.remove(id),
    onSuccess: (_result, id) => {
      setBoardsCache(queryClient, (prev) => prev.filter((b) => b.id !== id));
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) => boardApi.setFavorite(id, next),
    onMutate: ({ id, next }) => {
      setBoardsCache(queryClient, (prev) =>
        sortBoards(prev.map((b) => (b.id === id ? { ...b, is_favorite: next } : b)))
      );
    },
    onError: (err, { id, next }) => {
      // Surgical, single-item rollback — not a whole-list snapshot restore,
      // since a *different* board's favorite could have been toggled (and
      // already applied) concurrently; only this board's own change reverts.
      setBoardsCache(queryClient, (prev) =>
        sortBoards(prev.map((b) => (b.id === id ? { ...b, is_favorite: !next } : b)))
      );
      toast.error(errorMessage(err));
    },
  });

  const toggleFavorite = async (id: string) => {
    if (pendingFavoriteIds.current.has(id)) return;
    const board = boards.find((b) => b.id === id);
    if (!board) return;

    pendingFavoriteIds.current.add(id);
    try {
      await favoriteMutation.mutateAsync({ id, next: !board.is_favorite });
    } catch {
      // already toasted in onError
    } finally {
      pendingFavoriteIds.current.delete(id);
    }
  };

  return {
    boards,
    loading: boardsQuery.isLoading,
    create: (data: CreateBoardInput): Promise<Board> => createMutation.mutateAsync(data),
    update: (id: string, data: UpdateBoardInput): Promise<Board> => updateMutation.mutateAsync({ id, data }),
    remove: (id: string): Promise<void> => removeMutation.mutateAsync(id).then(() => undefined),
    toggleFavorite,
  };
};
