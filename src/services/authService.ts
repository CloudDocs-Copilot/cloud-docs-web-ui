
import axios from 'axios';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export async function registerUser(payload: RegisterPayload) {
  return axios.post(`${API_URL}/api/auth/register`, payload);
}
