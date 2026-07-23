export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  MY_TASKS: "/my-tasks",
  CALENDAR: "/calendar",
  TEAM: "/team",
  SETTINGS: "/settings",
  BOARD: (boardId: string) => `/board/${boardId}`,
  BOARD_PATH: "/board/:boardId",
  NOT_FOUND: "/404",
} as const;
