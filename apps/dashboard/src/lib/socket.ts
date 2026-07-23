// ----------------------------------------------------------------------------
// Realtime (Socket.IO) client
//
// Wraps a single shared Socket.IO connection so every part of the app
// (useBoard, ActivityFeed) talks to the same socket instead of opening one
// per component. The connection carries the JWT in its handshake, the same
// way axios attaches it as a header in lib/api.ts.
// ----------------------------------------------------------------------------

import { io, type Socket } from "socket.io-client";
import { getToken, type Task, type Column, type Board, type Activity, type PresenceUser } from "@flowboard/shared";

interface ServerToClientEvents {
  "task:created": (task: Task) => void;
  "task:updated": (task: Task) => void;
  "task:moved": (task: Task) => void;
  "task:deleted": (payload: { id: string }) => void;
  "column:created": (column: Column) => void;
  "column:updated": (column: Column) => void;
  "column:deleted": (payload: { id: string }) => void;
  "board:updated": (board: Board) => void;
  "board:deleted": (payload: { id: string }) => void;
  "activity:new": (activity: Activity) => void;
  "presence:sync": (payload: { boardId: string; users: PresenceUser[] }) => void;
  "presence:join": (payload: { user: PresenceUser; boardId: string }) => void;
  "presence:leave": (payload: { user: PresenceUser; boardId?: string }) => void;
  "presence:cursor": (payload: { user: PresenceUser; x: number; y: number }) => void;
}

interface ClientToServerEvents {
  "board:join": (boardId: string, ack?: (res: { ok: boolean; error?: string }) => void) => void;
  "board:leave": (boardId: string) => void;
  "presence:cursor": (payload: { boardId: string; x: number; y: number }) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5050";

let socket: AppSocket | null = null;

// Lazily create (and authenticate) the shared socket connection.
export const getSocket = (): AppSocket => {
  if (!socket) {
    socket = io(URL, {
      autoConnect: false,
      auth: { token: getToken() },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const connectSocket = (): AppSocket => {
  const s = getSocket();
  s.auth = { token: getToken() };
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = (): void => {
  if (socket) socket.disconnect();
};
