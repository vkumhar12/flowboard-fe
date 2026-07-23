import {
  api,
  type Activity,
  type Board,
  type BoardListItem,
  type BoardDetail,
  type BoardMember,
  type CreateBoardInput,
  type UpdateBoardInput,
  type AddMemberInput,
} from "@flowboard/shared";
import { ENDPOINTS } from "@/constants/endpoints";

export const boardService = {
  list: (): Promise<BoardListItem[]> =>
    api.get<{ boards: BoardListItem[] }>(ENDPOINTS.BOARDS.LIST).then((r) => r.data.boards),

  create: (data: CreateBoardInput): Promise<Board> =>
    api.post<{ board: Board }>(ENDPOINTS.BOARDS.CREATE, data).then((r) => r.data.board),

  get: (id: string): Promise<BoardDetail> =>
    api.get<BoardDetail>(ENDPOINTS.BOARDS.GET(id)).then((r) => r.data),

  update: (id: string, data: UpdateBoardInput): Promise<Board> =>
    api.patch<{ board: Board }>(ENDPOINTS.BOARDS.UPDATE(id), data).then((r) => r.data.board),

  remove: (id: string): Promise<{ success: true }> =>
    api.delete<{ success: true }>(ENDPOINTS.BOARDS.REMOVE(id)).then((r) => r.data),

  setFavorite: (id: string, isFavorite: boolean): Promise<{ is_favorite: boolean }> =>
    api
      .patch<{ is_favorite: boolean }>(ENDPOINTS.BOARDS.FAVORITE(id), { is_favorite: isFavorite })
      .then((r) => r.data),

  activity: (id: string, limit?: number): Promise<Activity[]> =>
    api
      .get<{ activities: Activity[] }>(ENDPOINTS.BOARDS.ACTIVITY(id), { params: { limit } })
      .then((r) => r.data.activities),

  addMember: (id: string, data: AddMemberInput): Promise<BoardMember> =>
    api.post<{ member: BoardMember }>(ENDPOINTS.BOARDS.ADD_MEMBER(id), data).then((r) => r.data.member),

  removeMember: (id: string, userId: string): Promise<{ success: true }> =>
    api.delete<{ success: true }>(ENDPOINTS.BOARDS.REMOVE_MEMBER(id, userId)).then((r) => r.data),
};
