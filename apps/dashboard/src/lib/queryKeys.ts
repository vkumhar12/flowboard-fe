// Central place for query keys, so useBoard.ts, useWorkspace.ts, and
// socket.ts's cache-writing handlers all agree on exactly what identifies
// "the list of boards" vs "board X's detail" — a typo'd inline key in one
// of those places would silently create a second, disconnected cache entry.
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  boards: {
    list: ["boards"] as const,
    detail: (boardId: string) => ["boards", boardId] as const,
  },
};
