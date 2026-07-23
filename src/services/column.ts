import api from "@/lib/api";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Column, CreateColumnInput, UpdateColumnInput } from "@/types/column";

export const columnService = {
  create: (boardId: string, data: CreateColumnInput): Promise<Column> =>
    api.post<{ column: Column }>(ENDPOINTS.COLUMNS.CREATE(boardId), data).then((r) => r.data.column),

  update: (boardId: string, columnId: string, data: UpdateColumnInput): Promise<Column> =>
    api.patch<{ column: Column }>(ENDPOINTS.COLUMNS.UPDATE(boardId, columnId), data).then((r) => r.data.column),

  remove: (boardId: string, columnId: string): Promise<{ success: true }> =>
    api.delete<{ success: true }>(ENDPOINTS.COLUMNS.REMOVE(boardId, columnId)).then((r) => r.data),
};
