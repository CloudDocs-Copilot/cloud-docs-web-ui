import { apiClient } from '../api';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  avatar?: string | null;
}

export interface SearchUsersResponse {
  success: boolean;
  data: User[];
}

/**
 * Busca usuarios por email
 * GET /api/users/search?email=xxx
 */
export const searchUserByEmail = async (email: string): Promise<User | null> => {
  if (!email || !email.includes('@')) {
    return null;
  }
  
  try {
    const response = await apiClient.get<SearchUsersResponse>(`/users/search`, {
      params: { email }
    });
    
    if (response.data.success && response.data.data.length > 0) {
      return response.data.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error searching user:', error);
    return null;
  }
};

export default {
  searchUserByEmail,
};
