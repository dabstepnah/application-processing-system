import { createApiClient } from "./http";
import type { Question, QuestionStatistics, QuestionStatus, Comment } from "../types";

const questionApi = createApiClient("http://localhost:8082");

export const createQuestion = async (title: string, body: string) => {
  const { data } = await questionApi.post<Question>("/api/questions", { title, description: body });
  return data;
};

export const getQuestions = async () => {
  const { data } = await questionApi.get<Question[]>("/api/questions");
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

export const deleteQuestion = async (id: number) => questionApi.delete(`/api/admin/questions/${id}`);

export const getAdminQuestions = async () => {
  const { data } = await questionApi.get<Question[]>("/api/admin/questions");
  return data;
};

export const getQuestionStatistics = async () => {
  const { data } = await questionApi.get<QuestionStatistics>("/api/admin/questions/statistics");
  return data;
};

export const addComment = async (questionId: number, text: string) => {
  const { data } = await questionApi.post<Comment>(`/api/questions/${questionId}/comments`, { text });
  return data;
};

export const getComments = async (questionId: number) => {
  const { data } = await questionApi.get<Comment[]>(`/api/questions/${questionId}/comments`);
  return data;
};

export const deleteComment = async (commentId: number) => questionApi.delete(`/api/admin/comments/${commentId}`);
