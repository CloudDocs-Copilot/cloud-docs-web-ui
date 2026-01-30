
/**
 * Roles de usuario disponibles en el sistema
 */
export type UserRole = 'user' | 'admin';

/**
 * Preferencias del usuario
 */
export interface UserPreferences {
  emailNotifications: boolean;
  documentUpdates: boolean;
  aiAnalysis: boolean;
}

/**
 * Interfaz del modelo de Usuario para el frontend
 * Basada en el modelo de Mongoose del backend
 * NOTA: El password nunca se expone desde el backend
 */
 export interface User {
  /** ID único del usuario */
  id: string;
  /** Nombre completo del usuario */
   name: string;
  /** Email único del usuario */
   email: string;
  /** Rol del usuario en el sistema */
  role: UserRole;
  /** Estado de activación del usuario */
  active: boolean;
  /** Versión del token (para invalidación de sesiones) */
  tokenVersion: number;
  /** Fecha del último cambio de contraseña */
  lastPasswordChange?: Date | string;
  /** ID de la organización a la que pertenece el usuario */
  organization?: string;
  /** ID de la carpeta raíz personal del usuario */
  rootFolder?: string;
  /** Almacenamiento utilizado por el usuario en bytes */
  storageUsed: number;
  /** URL o path del avatar del usuario */
   avatar?: string;
  /** Preferencias del usuario */
  preferences: UserPreferences;
  /** Fecha de creación del usuario */
  createdAt: Date | string;
  /** Fecha de última actualización */
  updatedAt: Date | string;
 }

/**
 * DTO para registro de nuevo usuario
 */
export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  organization?: string;
}

/**
 * DTO para login de usuario
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * Respuesta del login con tokens
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

/**
 * DTO para actualizar perfil de usuario
 * Todos los campos son opcionales
 */
export interface UpdateUserDto {
  name?: string;
  email?: string;
  avatar?: string;
}

/**
 * DTO para cambio de contraseña
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * DTO para actualización de usuario por admin
 */
export interface UpdateUserByAdminDto {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
  organization?: string;
}

/**
 * Helper para formatear el almacenamiento usado
 */
export const formatStorageUsed = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/**
 * Helper para obtener las iniciales del nombre
 */
export const getUserInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Helper para verificar si un usuario es admin
 */
export const isAdmin = (user: User): boolean => {
  return user.role === 'admin';
};

/**
 * Helper para verificar si un usuario está activo
 */
export const isActiveUser = (user: User): boolean => {
  return user.active === true;
};
