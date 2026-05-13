import { createApiClient } from "./http";
import type { Review, UserRating } from "../types";

const reviewApi = createApiClient("http://localhost:8083");

export const createReview = async (targetUserId: number, rating: number, comment: string) => {
  const { data } = await reviewApi.post<Review>("/api/reviews", { targetUserId, rating, comment });
  return data;
};

export const getReviewsByUser = async (userId: number) => {
  const { data } = await reviewApi.get<Review[]>(`/api/reviews/user/${userId}`);
  return data;
};

export const getUserRating = async (userId: number) => {
  const { data } = await reviewApi.get<UserRating>(`/api/reviews/user/${userId}/rating`);
  return data;
};

export const deleteReview = async (id: number) => reviewApi.delete(`/api/admin/reviews/${id}`);
