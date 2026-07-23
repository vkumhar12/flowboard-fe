// A user account row from the `users` table, as returned by the backend
// (never includes password_hash — that's stripped server-side).
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  // Omitted by endpoints that only need identity (e.g. user search),
  // present on /auth/me, register and login responses.
  created_at?: string;
}

// The minimal shape broadcast over Socket.IO presence events
// (who else currently has a board open).
export interface PresenceUser {
  id: string;
  name: string;
}
