import { QueryClient } from "@tanstack/react-query";

// One shared cache for the whole app — every useQuery/useMutation call
// reads and writes through this same client, which is what lets, e.g.,
// useBoard and useWorkspace share a single cached copy of the same board
// instead of each fetching it separately.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data here comes from a real backend a single user's browser talks
      // to, not a shared public API — background refetch-on-focus mostly
      // just adds noise/flicker for this app, so it's turned off. Socket.IO
      // (see socket.ts) is what keeps things live instead.
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
