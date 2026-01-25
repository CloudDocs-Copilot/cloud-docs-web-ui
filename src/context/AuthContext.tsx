import { createContext } from 'react';
import type { UserDTO } from '../services/auth.service';

export type AuthState = {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

