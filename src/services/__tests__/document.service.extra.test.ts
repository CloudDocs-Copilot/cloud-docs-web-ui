import * as DocService from '../../services/document.service';
jest.mock('../../api', () => ({ apiClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn(), patch: jest.fn() } }));
import { apiClient } from '../../api';

describe('document.service basic operations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listDocuments returns server data', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { success: true, count: 0, documents: [] } });
    const res = await DocService.listDocuments();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.documents)).toBe(true);
  });

  it('getDocument returns document', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { success: true, document: { id: 'd1' } } });
    const res = await DocService.getDocument('d1');
    expect(res.document.id).toBe('d1');
  });

  it('deleteDocument calls delete and returns response', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true, message: 'ok' } });
    const res = await DocService.deleteDocument('d1');
    expect(res.success).toBe(true);
  });

  it('moveDocument calls patch and returns document', async () => {
    (apiClient.patch as jest.Mock).mockResolvedValue({ data: { success: true, message: 'moved', document: { id: 'd1' } } });
    const res = await DocService.moveDocument('d1', 'f2');
    expect(res.document.id).toBe('d1');
  });

  it('copyDocument and shareDocument use post and return document', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { success: true, message: 'ok', document: { id: 'd2' } } });
    const copy = await DocService.copyDocument('d1', 'f2');
    expect(copy.document.id).toBe('d2');

    const share = await DocService.shareDocument('d1', ['u1']);
    expect(share.document.id).toBe('d2');
  });
});
