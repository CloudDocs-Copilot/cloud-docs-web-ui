import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/env';

/**
 * Derives the socket server origin from the API base URL.
 * Example:
 *  API:    http://localhost:4000/api
 *  Socket: http://localhost:4000
 */
function getSocketBaseUrl(): string {
  const apiBase = API_BASE_URL;

  const apiBaseStr = String(apiBase);
  // Remove trailing "/api" if present
  return apiBaseStr.replace(/\/api\/?$/, '');
}

let socketSingleton: Socket | null = null;

export function getSocket(): Socket {
  if (socketSingleton) return socketSingleton;

  const baseUrl = getSocketBaseUrl();

  socketSingleton = io(baseUrl, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socketSingleton;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  if (!socketSingleton) return;
  try {
    socketSingleton.disconnect();
  } catch {
    // ignore
  }
}
