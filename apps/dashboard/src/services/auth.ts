import { api, type User, type AuthResponse, type RegisterInput, type LoginInput } from "@flowboard/shared";
import { ENDPOINTS } from "@/constants/endpoints";

export const authService = {
  register: (data: RegisterInput): Promise<AuthResponse> =>
    api.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, data).then((r) => r.data),
  login: (data: LoginInput): Promise<AuthResponse> =>
    api.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, data).then((r) => r.data),
  me: (): Promise<User> => api.get<{ user: User }>(ENDPOINTS.AUTH.ME).then((r) => r.data.user),
};
