import { loginRequest, logoutRequest, registerRequest, forgotPasswordRequest, resetPasswordRequest } from '../../services/auth.service';
import { apiClient } from '../../api';

jest.mock('../../api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loginRequest returns user data', async () => {
    const user = { id: '1', name: 'Test', email: 't@t.com', role: 'user', active: true };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { message: 'ok', user } });

    const resp = await loginRequest({ email: 't@t.com', password: 'p' });
    expect(resp).toEqual({ message: 'ok', user });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 't@t.com', password: 'p' });
  });

  it('logoutRequest calls logout', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { message: 'bye' } });
    const resp = await logoutRequest();
    expect(resp).toEqual({ message: 'bye' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('registerRequest calls register', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { message: 'created', user: {} } });
    const resp = await registerRequest({ name: 'a', email: 'a@a.com', password: 'p' });
    expect(resp).toHaveProperty('message');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', { name: 'a', email: 'a@a.com', password: 'p' });
  });

  it('forgotPasswordRequest calls endpoint', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { message: 'sent' } });
    const resp = await forgotPasswordRequest('a@a.com');
    expect(resp).toEqual({ message: 'sent' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'a@a.com' });
  });

  it('resetPasswordRequest calls endpoint', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { message: 'reset' } });
    const payload = { token: 't', newPassword: 'n', confirmPassword: 'n' };
    const resp = await resetPasswordRequest(payload);
    expect(resp).toEqual({ message: 'reset' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', payload);
  });
});
