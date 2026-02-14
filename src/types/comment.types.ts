export interface CommentUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface Comment {
  id?: string;
  document: string;
  organization?: string | null;
  createdBy: CommentUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListCommentsResponse {
  success: boolean;
  count: number;
  comments: Comment[];
}

export interface CreateCommentResponse {
  success: boolean;
  message: string;
  comment: Comment;
}

export interface UpdateCommentResponse {
  success: boolean;
  message: string;
  comment: Comment;
}
