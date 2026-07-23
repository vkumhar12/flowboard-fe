import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/services";
import { setToken, clearToken, getToken } from "@/lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { queryKeys } from "../lib/queryKeys";
import type { User } from "@/types/user";
import type { RegisterInput, LoginInput } from "@/types/auth";

// No React Context here — the TanStack Query cache (via QueryClientProvider,
// see App.tsx) already is the shared state, so this is a plain hook that
// every component calls independently and all get the same cached `user`.
export const useAuth = () => {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me(),
    enabled: Boolean(getToken()),
  });

  // Mirrors the old "restore session on first load" effect: once a stored
  // token turns out to be valid, (re)connect the socket; if it turns out to
  // be invalid/expired, drop it so we don't keep retrying forever.
  useEffect(() => {
    if (meQuery.isSuccess) connectSocket();
  }, [meQuery.isSuccess]);

  useEffect(() => {
    if (meQuery.isError) clearToken();
  }, [meQuery.isError]);

  const handleAuth = ({ user, token }: { user: User; token: string }): User => {
    setToken(token);
    queryClient.setQueryData(queryKeys.auth.me, user);
    connectSocket();
    return user;
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
  });

  const login = async (data: LoginInput): Promise<User> => handleAuth(await loginMutation.mutateAsync(data));
  const register = async (data: RegisterInput): Promise<User> => handleAuth(await registerMutation.mutateAsync(data));

  const logout = () => {
    clearToken();
    disconnectSocket();
    queryClient.clear();
  };

  return {
    user: meQuery.data ?? null,
    loading: meQuery.isLoading,
    login,
    register,
    logout,
  };
};
