import { useHttpRequest } from '../../hooks/useHttpRequest';

/**
 * Ejemplo de uso del hook useHttpRequest
 * Este archivo muestra diferentes casos de uso del hook para consumir APIs
 */

// Definir interfaces para los datos
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface Document {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdAt: string;
}

/**
 * Ejemplo 1: Petición GET simple
 * Hook para obtener un usuario. El userId se usa al llamar execute()
 */
export const useGetUser = () => {
  return useHttpRequest<User>({
    onSuccess: (data) => {
      console.log('Usuario cargado:', data);
    },
    onError: (error) => {
      console.error('Error al cargar usuario:', error.message);
    },
  });
};

/**
 * Ejemplo 2: Petición POST con validación
 */
export const useCreateUser = () => {
  return useHttpRequest<User, CreateUserRequest>({
    onSuccess: (data) => {
      console.log('Usuario creado exitosamente:', data);
    },
    onError: (error) => {
      console.error('Error al crear usuario:', error);
    },
  });
};

/**
 * Ejemplo 3: Petición con reintentos automáticos
 */
export const useGetDocuments = () => {
  return useHttpRequest<Document[]>({
    retry: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
      console.log(`${data.length} documentos cargados`);
    },
  });
};

/**
 * Ejemplo 4: Hook con opción enabled
 */
export const useConditionalFetch = (shouldFetch: boolean) => {
  return useHttpRequest<User[]>({
    enabled: shouldFetch,
    refetchOnWindowFocus: true,
  });
};

/**
 * Ejemplo de componente usando el hook
 */
/*
import React, { useEffect } from 'react';
import { useGetUser, useCreateUser } from './examples/useApiExamples';

const UserProfile: React.FC<{ userId: number }> = ({ userId }) => {
  const { execute: fetchUser, data, isLoading, error } = useGetUser(userId);
  const { 
    execute: createUser, 
    isLoading: isCreating,
    error: createError 
  } = useCreateUser();

  useEffect(() => {
    // Cargar usuario al montar el componente
    fetchUser({
      method: 'GET',
      url: `/users/${userId}`,
    });
  }, [userId]);

  const handleCreateUser = async () => {
    const result = await createUser(
      {
        method: 'POST',
        url: '/users',
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'secure123',
        },
      },
      {
        // Validación personalizada
        validate: (data) => {
          if (!data.email.includes('@')) {
            return 'Email inválido';
          }
          if (data.password.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
          }
          return true;
        },
        sanitize: true,
      }
    );

    if (result) {
      console.log('Usuario creado:', result);
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>Email: {data.email}</p>
      <p>Rol: {data.role}</p>
      <button onClick={handleCreateUser} disabled={isCreating}>
        {isCreating ? 'Creando...' : 'Crear Usuario'}
      </button>
      {createError && <p style={{ color: 'red' }}>{createError.message}</p>}
    </div>
  );
};

export default UserProfile;
*/

