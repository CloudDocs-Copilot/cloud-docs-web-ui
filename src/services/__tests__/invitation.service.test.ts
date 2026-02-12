import { apiClient } from '../../api';
import invitationService, { getPendingInvitations, acceptInvitation, rejectInvitation } from '../invitation.service';

jest.mock('../../api', () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));

describe('invitation.service', () => {
  afterEach(() => jest.resetAllMocks());

  describe('getPendingInvitations', () => {
    it('getPendingInvitations returns data array', async () => {
      const mockData = { data: [{ id: 'i1' }], success: true };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });
      const res = await getPendingInvitations();
      expect(res).toEqual(mockData.data);
      expect(apiClient.get).toHaveBeenCalledWith('/memberships/pending-invitations');
    });

    it('returns empty array when no invitations', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: { data: [], success: true } });
      const res = await getPendingInvitations();
      expect(res).toEqual([]);
    });

    it('handles API errors', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));
      await expect(getPendingInvitations()).rejects.toThrow('Network error');
    });
  });

  describe('acceptInvitation', () => {
    it('acceptInvitation returns response data', async () => {
      const resp = { membership: { id: 'm1' } };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: resp });
      const out = await acceptInvitation('m1');
      expect(out).toEqual(resp);
      expect(apiClient.post).toHaveBeenCalledWith('/memberships/invitations/m1/accept');
    });

    it('handles accept failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Invalid invitation'));
      await expect(acceptInvitation('invalid')).rejects.toThrow('Invalid invitation');
    });
  });

  describe('rejectInvitation', () => {
    it('rejectInvitation returns response data', async () => {
      const resp = { ok: true };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: resp });
      const out = await rejectInvitation('m2');
      expect(out).toEqual(resp);
      expect(apiClient.post).toHaveBeenCalledWith('/memberships/invitations/m2/reject');
    });

    it('handles reject failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Server error'));
      await expect(rejectInvitation('m3')).rejects.toThrow('Server error');
    });
  });

  describe('default export', () => {
    it('exports all service methods', () => {
      expect(invitationService.getPendingInvitations).toBe(getPendingInvitations);
      expect(invitationService.acceptInvitation).toBe(acceptInvitation);
      expect(invitationService.rejectInvitation).toBe(rejectInvitation);
    });
  });
});
