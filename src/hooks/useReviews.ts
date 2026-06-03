import { useState, useEffect, useCallback } from "react";
import type { Review } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useCourtReviews(courtId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("court_id", courtId)
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  }, [courtId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, loading, avgRating, refresh: fetchReviews };
}

export function useReviewActions() {
  const { user } = useAuth();

  const addReview = useCallback(
    async (courtId: string, rating: number, comment: string) => {
      if (!user) return { error: "Not authenticated" };
      const { error } = await supabase.from("reviews").upsert(
        {
          user_id: user.id,
          court_id: courtId,
          rating,
          comment,
        },
        { onConflict: "user_id,court_id" }
      );
      return { error: error?.message ?? null };
    },
    [user]
  );

  const deleteReview = useCallback(async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    return { error: error?.message ?? null };
  }, []);

  return { addReview, deleteReview };
}
