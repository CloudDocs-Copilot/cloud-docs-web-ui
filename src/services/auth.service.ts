// src/services/auth.service.ts
import { apiFetch } from "./api";

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  active: boolean;
  organization?: string;
  rootFolder?: string;
};

export async function loginRequest(payload: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<{ message: string; user: UserDTO }> {
  return apiFetch<{ message: string; user: UserDTO }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshRequest(): Promise<{ message: string; user: UserDTO }> {
  return apiFetch<{ message: string; user: UserDTO }>("/api/auth/refresh", {
    method: "POST",
  });
}

export async function logoutRequest(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}
