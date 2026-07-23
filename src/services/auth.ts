import api from "@/lib/api";
import { ENDPOINTS } from "@/constants/endpoints";
import type { User } from "@/types/user";
import type { AuthResponse, RegisterInput, LoginInput } from "@/types/auth";

export const authService = {
  register: (data: RegisterInput): Promise<AuthResponse> =>
    api.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, data).then((r) => r.data),
  login: (data: LoginInput): Promise<AuthResponse> =>
    api.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, data).then((r) => r.data),
  me: (): Promise<User> => api.get<{ user: User }>(ENDPOINTS.AUTH.ME).then((r) => r.data.user),
};
