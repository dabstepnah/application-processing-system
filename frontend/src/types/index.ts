export type Role = "USER" | "ADMIN";

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  role: Role;
}

export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { username: string; email: string; password: string; }

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  banned: boolean;
  createdAt: string;
}

export type QuestionStatus = "OPEN" | "DISCUSSION" | "SOLVED" | "RESOLVED" | "CLOSED";

export interface Question {
  id: number;
  title: string;
  body: string;
  tags: string[];
  status: QuestionStatus;
  authorId: number;
  solved: boolean;
  acceptedCommentId: number | null;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
}

export interface QuestionStatistics {
  totalQuestions: number;
  openQuestions: number;
  discussionQuestions: number;
  resolvedQuestions: number;
  closedQuestions: number;
  totalComments: number;
}

export interface Comment {
  id: number;
  questionId: number;
  authorId: number;
  authorUsername: string;
  text: string;
  parentCommentId: number | null;
  deleted: boolean;
  likesCount: number;
  likedByCurrentUser: boolean;
  acceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentLikeResponse {
  commentId: number;
  likesCount: number;
  likedByCurrentUser: boolean;
}

export interface Review {
  reviewId: number;
  authorId: number;
  authorUsername: string | null;
  targetUserId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserRating {
  userId: number;
  averageRating: number;
  totalReviews: number;
}

export interface AuthState {
  token: string | null;
  userId: number | null;
  username: string | null;
  role: Role | null;
}
