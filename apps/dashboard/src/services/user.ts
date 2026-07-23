import { api, type User } from "@flowboard/shared";
import { ENDPOINTS } from "@/constants/endpoints";

export const userService = {
  search: (q?: string): Promise<User[]> =>
    api.get<{ users: User[] }>(ENDPOINTS.USERS.SEARCH, { params: { q } }).then((r) => r.data.users),
};
