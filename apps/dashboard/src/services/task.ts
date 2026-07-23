import { api, type Task, type CreateTaskInput, type UpdateTaskInput, type MoveTaskInput, type TaskListFilters } from "@flowboard/shared";
import { ENDPOINTS } from "@/constants/endpoints";

export const taskService = {
  list: (boardId: string, filters?: TaskListFilters): Promise<Task[]> =>
    api.get<{ tasks: Task[] }>(ENDPOINTS.TASKS.LIST(boardId), { params: filters }).then((r) => r.data.tasks),

  create: (boardId: string, data: CreateTaskInput): Promise<Task> =>
    api.post<{ task: Task }>(ENDPOINTS.TASKS.CREATE(boardId), data).then((r) => r.data.task),

  update: (boardId: string, taskId: string, data: UpdateTaskInput): Promise<Task> =>
    api.patch<{ task: Task }>(ENDPOINTS.TASKS.UPDATE(boardId, taskId), data).then((r) => r.data.task),

  move: (boardId: string, taskId: string, data: MoveTaskInput): Promise<Task> =>
    api.patch<{ task: Task }>(ENDPOINTS.TASKS.MOVE(boardId, taskId), data).then((r) => r.data.task),

  remove: (boardId: string, taskId: string): Promise<{ success: true }> =>
    api.delete<{ success: true }>(ENDPOINTS.TASKS.REMOVE(boardId, taskId)).then((r) => r.data),
};
