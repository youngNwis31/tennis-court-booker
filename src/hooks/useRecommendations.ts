import { useMemo } from "react";
import type { Booking, Recommendation } from "../types";
import { courts } from "../data/courts";
import { buildRecommendations } from "../services/recommendation";

export type { Recommendation };

export function useRecommendations(bookings: Booking[]): Recommendation[] {
  return useMemo(() => buildRecommendations(bookings, courts), [bookings]);
}
