import api from "@/lib/api";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
  AISuggestion,
  AISummary,
  GenerateTasksInput,
  BreakdownTaskInput,
  GenerateTasksResponse,
} from "@/types/ai";

export const aiService = {
  generateTasks: (boardId: string, data: GenerateTasksInput): Promise<GenerateTasksResponse> =>
    api.post<GenerateTasksResponse>(ENDPOINTS.AI.GENERATE_TASKS(boardId), data).then((r) => r.data),

  breakdown: (boardId: string, data: BreakdownTaskInput): Promise<AISuggestion[]> =>
    api
      .post<{ subtasks: AISuggestion[] }>(ENDPOINTS.AI.BREAKDOWN(boardId), data)
      .then((r) => r.data.subtasks),

  summary: (boardId: string): Promise<AISummary> =>
    api.post<{ summary: AISummary }>(ENDPOINTS.AI.SUMMARY(boardId)).then((r) => r.data.summary),
};
