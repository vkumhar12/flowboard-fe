import { api, type Column, type CreateColumnInput, type UpdateColumnInput } from "@flowboard/shared";
import { ENDPOINTS } from "@/constants/endpoints";

export const columnService = {
  create: (boardId: string, data: CreateColumnInput): Promise<Column> =>
    api.post<{ column: Column }>(ENDPOINTS.COLUMNS.CREATE(boardId), data).then((r) => r.data.column),

  update: (boardId: string, columnId: string, data: UpdateColumnInput): Promise<Column> =>
    api.patch<{ column: Column }>(ENDPOINTS.COLUMNS.UPDATE(boardId, columnId), data).then((r) => r.data.column),

  remove: (boardId: string, columnId: string): Promise<{ success: true }> =>
    api.delete<{ success: true }>(ENDPOINTS.COLUMNS.REMOVE(boardId, columnId)).then((r) => r.data),
};
