import type {
  ListCommentsResponse,
  CreateCommentResponse,
  UpdateCommentResponse,
} from '../types/comment.types';
import { apiClient } from '../api';

export const commentsService = {
  async listByDocument(documentId: string): Promise<ListCommentsResponse> {
    const { data } = await apiClient.get(`/comments/documents/${documentId}`);
    return data;
  },

  async create(documentId: string, content: string): Promise<CreateCommentResponse> {
    const { data } = await apiClient.post(`/comments/documents/${documentId}`, { content });
    return data;
  },

  async update(commentId: string, content: string): Promise<UpdateCommentResponse> {
    const { data } = await apiClient.patch(`/comments/${commentId}`, { content });
    return data;
  },
};
