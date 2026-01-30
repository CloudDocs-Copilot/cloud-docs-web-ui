import { apiClient } from '../api';
import type { User } from '../types/user.types';

/**
 * Interfaz para la respuesta de la API al obtener el perfil del usuario
 */
export interface UserProfileResponse {
  success: boolean;
  user: User;
}

/**
 * Interfaz para actualizar el perfil del usuario
 */
export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
}

/**
 * Interfaz para actualizar la contraseña
 */
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Interfaz para la respuesta al actualizar datos
 */
export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

/**
 * Servicio para gestionar operaciones relacionadas con el perfil de usuario
 */
export const userService = {
  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/users/profile');
    return response.data;
  },

  /**
   * Actualiza el perfil del usuario actual
   */
  updateProfile: async (data: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> => {
    const response = await apiClient.put<UpdateUserProfileResponse>('/users/profile', data);
    return response.data;
  },

  /**
   * Actualiza la contraseña del usuario actual
   */
  updatePassword: async (data: UpdatePasswordRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>('/users/password', data);
    return response.data;
  },

  /**
   * Elimina la cuenta del usuario actual
   */
  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/users/profile');
    return response.data;
  },

  /**
   * Sube una imagen de perfil
   */
  uploadProfileImage: async (file: File): Promise<{ success: boolean; imageUrl: string }> => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const response = await apiClient.post<{ success: boolean; imageUrl: string }>(
      '/users/profile/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
