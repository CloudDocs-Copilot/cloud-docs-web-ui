import { userService, searchUserByEmail } from '../../services/user.service';
import { apiClient } from '../../api';

jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
  },
}));

describe('user.service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getProfile returns data', async () => {
    const data = { success: true, user: { id: '1', name: 'U', email: 'u@u.com' } };
    (apiClient.get as jest.Mock).mockResolvedValue({ data });
    const resp = await userService.getProfile();
    expect(resp).toEqual(data);
    expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
  });

  it('searchUserByEmail returns null for invalid email', async () => {
    const out = await searchUserByEmail('invalid');
    expect(out).toBeNull();
  });

  it('searchUserByEmail returns first user when found', async () => {
    const payload = { success: true, data: [{ id: '1', name: 'A', email: 'a@a.com' }] };
    (apiClient.get as jest.Mock).mockResolvedValue({ data: payload });
    const user = await searchUserByEmail('a@a.com');
    expect(user).toEqual(payload.data[0]);
  });

  it('updateProfile calls put', async () => {
    const respData = { success: true, message: 'ok', user: { id: '1' } };
    (apiClient.put as jest.Mock).mockResolvedValue({ data: respData });
    const resp = await userService.updateProfile({ name: 'New' });
    expect(resp).toEqual(respData);
    expect(apiClient.put).toHaveBeenCalledWith('/users/profile', { name: 'New' });
  });
});
