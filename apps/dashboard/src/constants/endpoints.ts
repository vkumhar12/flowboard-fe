export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
  },
  USERS: {
    SEARCH: "/users/search",
  },
  BOARDS: {
    LIST: "/boards",
    CREATE: "/boards",
    GET: (id: string) => `/boards/${id}`,
    UPDATE: (id: string) => `/boards/${id}`,
    REMOVE: (id: string) => `/boards/${id}`,
    FAVORITE: (id: string) => `/boards/${id}/favorite`,
    ACTIVITY: (id: string) => `/boards/${id}/activity`,
    ADD_MEMBER: (id: string) => `/boards/${id}/members`,
    REMOVE_MEMBER: (id: string, userId: string) => `/boards/${id}/members/${userId}`,
  },
  COLUMNS: {
    CREATE: (boardId: string) => `/boards/${boardId}/columns`,
    UPDATE: (boardId: string, columnId: string) => `/boards/${boardId}/columns/${columnId}`,
    REMOVE: (boardId: string, columnId: string) => `/boards/${boardId}/columns/${columnId}`,
  },
  TASKS: {
    LIST: (boardId: string) => `/boards/${boardId}/tasks`,
    CREATE: (boardId: string) => `/boards/${boardId}/tasks`,
    UPDATE: (boardId: string, taskId: string) => `/boards/${boardId}/tasks/${taskId}`,
    MOVE: (boardId: string, taskId: string) => `/boards/${boardId}/tasks/${taskId}/move`,
    REMOVE: (boardId: string, taskId: string) => `/boards/${boardId}/tasks/${taskId}`,
  },
  AI: {
    GENERATE_TASKS: (boardId: string) => `/boards/${boardId}/ai/generate-tasks`,
    BREAKDOWN: (boardId: string) => `/boards/${boardId}/ai/breakdown`,
    SUMMARY: (boardId: string) => `/boards/${boardId}/ai/summary`,
  },
} as const;
