import { useState } from "react";
import { useCourtReviews, useReviewActions } from "../hooks/useReviews";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "./StarRating";
import { ReviewSummary } from "./ReviewSummary";
import { Link } from "react-router-dom";

export function ReviewSection({ courtId }: { courtId: string }) {
  const { reviews, loading, avgRating, refresh } = useCourtReviews(courtId);
  const { addReview } = useReviewActions();
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userReview = reviews.find((r) => r.user_id === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setError(null);
    const { error } = await addReview(courtId, rating, comment.trim());
    if (error) {
      setError(error);
    } else {
      setComment("");
      setRating(5);
      await refresh();
    }
    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} size="sm" />
            <span className="text-sm font-semibold text-gray-700">
              {avgRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <ReviewSummary reviews={reviews} />

      {/* Review form */}
      {user ? (
        !userReview ? (
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Leave a review</p>
            <StarRating rating={rating} interactive onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              required
              rows={3}
              className="w-full mt-3 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="mt-3 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-400 mb-4">You've already reviewed this court.</p>
        )
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          <Link to="/auth" className="text-emerald-600 hover:underline">Sign in</Link> to leave a review.
        </p>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No reviews yet — be the first!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
