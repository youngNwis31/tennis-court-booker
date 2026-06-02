import { useState, useEffect, useCallback } from "react";
import type { Booking } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useCourtBookings(courtId: string, date: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("court_id", courtId)
      .eq("date", date);
    setBookings(data ?? []);
    setLoading(false);
  }, [courtId, date]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const isSlotBooked = useCallback(
    (hour: number) => bookings.some((b) => b.start_hour === hour),
    [bookings]
  );

  return { bookings, loading, isSlotBooked, refresh: fetchBookings };
}

export function useUserBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .order("start_hour", { ascending: true });
    setBookings(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, refresh: fetchBookings };
}

export function useBookingActions() {
  const { user } = useAuth();

  const addBooking = useCallback(
    async (courtId: string, date: string, startHour: number) => {
      if (!user) return { error: "Not authenticated" };
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        court_id: courtId,
        date,
        start_hour: startHour,
      });
      return { error: error?.message ?? null };
    },
    [user]
  );

  const cancelBooking = useCallback(async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    return { error: error?.message ?? null };
  }, []);

  return { addBooking, cancelBooking };
}
