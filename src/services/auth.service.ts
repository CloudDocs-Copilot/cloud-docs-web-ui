// src/services/auth.service.ts
import { apiClient } from "../api";

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  active: boolean;
  organization?: string;
  rootFolder?: string;
};

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function loginRequest(payload: {
  email: string;
  password: string;  
}): Promise<{ message: string; user: UserDTO }> {
  const resp = await apiClient.post<{ message: string; user: UserDTO }>(
    '/auth/login',
    payload
  );

  return resp.data;
}



export async function logoutRequest(): Promise<{ message: string }> {
  const resp = await apiClient.post<{ message: string }>('/auth/logout');
  return resp.data;
}



/**
 * Register a new user using the same `apiFetch` wrapper
 */
export async function registerRequest(payload: RegisterPayload): Promise<{ message: string; user?: UserDTO }> {
  const resp = await apiClient.post<{ message: string; user?: UserDTO }>(
    '/auth/register',
    payload
  );
  return resp.data;
}



// Solicitar link de recuperación de contraseña
export async function forgotPasswordRequest(email: string): Promise<{ message: string }> {
  const resp = await apiClient.post<{ message: string }>(
    "/auth/forgot-password",
    { email }
  );

  return resp.data;
}

// Resetear contraseña usando token
export async function resetPasswordRequest(payload: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  const resp = await apiClient.post<{ message: string }>(
    "/auth/reset-password",
    payload
  );

  return resp.data;
}