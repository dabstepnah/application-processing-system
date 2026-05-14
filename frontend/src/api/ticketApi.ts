import { createApiClient } from "./http";
import type { Comment, CommentLikeResponse, Question, QuestionStatistics, QuestionStatus } from "../types";

const questionApi = createApiClient("http://localhost:8082");

export const createQuestion = async (title: string, content: string) => {
  const { data } = await questionApi.post<Question>("/api/questions", { title, content });
  return data;
};

export const getQuestions = async (params?: { sort?: "newest" | "popular" }) => {
  const { data } = await questionApi.get<Question[]>("/api/questions", { params });
  return data;
};

export const searchQuestions = async (query: string, sort: "newest" | "popular" = "newest") => {
  const { data } = await questionApi.get<Question[]>("/api/questions/search", { params: { query, sort } });
  return data;
};

export const getQuestionById = async (id: number) => {
  const { data } = await questionApi.get<Question>(`/api/questions/${id}`);
  return data;
};

export const getQuestionsByUser = async (userId: number) => {
  const { data } = await questionApi.get<Question[]>(`/api/questions/user/${userId}`);
  return data;
};

export const updateQuestionStatus = async (id: number, status: QuestionStatus) => {
  const { data } = await questionApi.patch<Question>(`/api/questions/${id}/status`, { status });
  return data;
};

export const acceptAnswer = async (questionId: number, commentId: number) => {
  const { data } = await questionApi.post<Question>(`/api/questions/${questionId}/accept-answer/${commentId}`);
  return data;
};

export const clearAcceptedAnswer = async (questionId: number) => {
  const { data } = await questionApi.delete<Question>(`/api/questions/${questionId}/accept-answer`);
  return data;
};

export const deleteQuestion = async (id: number) => questionApi.delete(`/api/admin/questions/${id}`);

export const getAdminQuestions = async () => {
  const { data } = await questionApi.get<Question[]>("/api/admin/questions");
  return data;
};

export const getQuestionStatistics = async () => {
  const { data } = await questionApi.get<QuestionStatistics>("/api/admin/questions/statistics");
  return data;
};

export const addComment = async (questionId: number, text: string, parentCommentId?: number | null) => {
  const { data } = await questionApi.post<Comment>(`/api/questions/${questionId}/comments`, {
    text,
    parentCommentId: parentCommentId ?? null
  });
  return data;
};

export const getComments = async (questionId: number) => {
  const { data } = await questionApi.get<Comment[]>(`/api/questions/${questionId}/comments`);
  return data;
};

export const toggleCommentLike = async (commentId: number) => {
  const { data } = await questionApi.post<CommentLikeResponse>(`/api/comments/${commentId}/like`);
  return data;
};

export const deleteComment = async (commentId: number) => questionApi.delete(`/api/admin/comments/${commentId}`);
