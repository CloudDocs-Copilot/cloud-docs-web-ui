import membershipService, { inviteMember, type InviteMemberPayload } from '../membership.service';
import { apiClient } from '../../api';
import type { AxiosResponse } from 'axios';

jest.mock('../../api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));
 

describe('membership.service', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteMember', () => {
    it('invites member with default role successfully', async () => {
      const payload: InviteMemberPayload = {
        userId: 'user-123',
      };

      const mockResponse = {
        success: true,
        message: 'Invitation sent',
        invitation: {
          id: 'inv-1',
          organizationId: 'org-1',
          user: 'user-123',
          role: 'member',
          status: 'pending',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
      } as AxiosResponse);

      const result = await inviteMember('org-1', payload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/memberships/organization/org-1/members', payload);
      expect(result.success).toBe(true);
      expect(result.invitation).toBeDefined();
      expect(result.invitation?.user).toBe('user-123');
    });

    it('invites member with specified role', async () => {
      const payload: InviteMemberPayload = {
        userId: 'user-456',
        role: 'admin',
      };

      const mockResponse = {
        success: true,
        message: 'Admin invitation sent',
        invitation: {
          id: 'inv-2',
          organizationId: 'org-2',
          user: 'user-456',
          role: 'admin',
          status: 'pending',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
      } as AxiosResponse);

      const result = await inviteMember('org-2', payload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/memberships/organization/org-2/members', payload);
      expect(result.invitation?.role).toBe('admin');
    });

    it('handles invitation to viewer role', async () => {
      const payload: InviteMemberPayload = {
        userId: 'user-789',
        role: 'viewer',
      };

      const mockResponse = {
        success: true,
        message: 'Viewer invitation sent',
        invitation: {
          id: 'inv-3',
          organizationId: 'org-1',
          user: 'user-789',
          role: 'viewer',
          status: 'pending',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
      } as AxiosResponse);

      const result = await inviteMember('org-1', payload);

      expect(result.invitation?.role).toBe('viewer');
    });

    it('handles user already member error', async () => {
      const payload: InviteMemberPayload = {
        userId: 'existing-user',
      };

      const mockResponse = {
        success: false,
        message: 'User is already a member',
        invitation: null,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
      } as AxiosResponse);

      const result = await inviteMember('org-1', payload);

      expect(result.success).toBe(false);
      expect(result.invitation).toBeNull();
      expect(result.message).toContain('already a member');
    });

    it('handles pending invitation exists', async () => {
      const payload: InviteMemberPayload = {
        userId: 'pending-user',
      };

      const mockResponse = {
        success: false,
        message: 'Pending invitation already exists',
        invitation: null,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
      } as AxiosResponse);

      const result = await inviteMember('org-1', payload);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Pending invitation');
    });

    it('throws error when user not found', async () => {
      const payload: InviteMemberPayload = {
        userId: 'nonexistent-user',
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('User not found'));

      await expect(inviteMember('org-1', payload)).rejects.toThrow('User not found');
    });

    it('throws error when organization not found', async () => {
      const payload: InviteMemberPayload = {
        userId: 'user-123',
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Organization not found'));

      await expect(inviteMember('nonexistent-org', payload)).rejects.toThrow('Organization not found');
    });

    it('handles network errors', async () => {
      const payload: InviteMemberPayload = {
        userId: 'user-123',
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(inviteMember('org-1', payload)).rejects.toThrow('Network error');
    });
  });

  describe('default export', () => {
    it('exports inviteMember method', () => {
      expect(membershipService.inviteMember).toBe(inviteMember);
    });
  });
});
