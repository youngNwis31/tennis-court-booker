import type { Review } from "../types";
import { supabase } from "../config/supabase";

export async function fetchCourtReviews(courtId: string): Promise<Review[]> {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("court_id", courtId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createReview(userId: string, courtId: string, rating: number, comment: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("reviews").upsert(
    { user_id: userId, court_id: courtId, rating, comment },
    { onConflict: "user_id,court_id" }
  );
  return { error: error?.message ?? null };
}

export async function deleteReview(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export function computeAvgRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
