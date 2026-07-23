import api from "@/lib/api";
import { ENDPOINTS } from "@/constants/endpoints";
import type { User } from "@/types/user";

export const userService = {
  search: (q?: string): Promise<User[]> =>
    api.get<{ users: User[] }>(ENDPOINTS.USERS.SEARCH, { params: { q } }).then((r) => r.data.users),
};
