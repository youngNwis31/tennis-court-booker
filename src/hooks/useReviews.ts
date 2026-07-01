import { useState, useEffect, useCallback } from "react";
import type { Review } from "../types";
import { useAuth } from "../providers/AuthProvider";
import * as reviewService from "../services/review";

export function useCourtReviews(courtId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const data = await reviewService.fetchCourtReviews(courtId);
    setReviews(data);
    setLoading(false);
  }, [courtId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating = reviewService.computeAvgRating(reviews);

  return { reviews, loading, avgRating, refresh: fetchReviews };
}

export function useReviewActions() {
  const { user } = useAuth();

  const addReview = useCallback(
    async (courtId: string, rating: number, comment: string) => {
      if (!user) return { error: "Not authenticated" };
      return reviewService.createReview(user.id, courtId, rating, comment);
    },
    [user]
  );

  const deleteReview = useCallback(async (id: string) => {
    return reviewService.deleteReview(id);
  }, []);

  return { addReview, deleteReview };
}
