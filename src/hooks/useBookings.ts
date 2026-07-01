import { useState, useEffect, useCallback } from "react";
import type { Booking } from "../types";
import { useAuth } from "../providers/AuthProvider";
import * as bookingService from "../services/booking";

export function useCourtBookings(courtId: string, date: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const data = await bookingService.fetchCourtBookings(courtId, date);
    setBookings(data);
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
    const data = await bookingService.fetchUserBookings(user.id);
    setBookings(data);
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
      return bookingService.createBooking(user.id, courtId, date, startHour);
    },
    [user]
  );

  const cancelBooking = useCallback(async (id: string) => {
    return bookingService.deleteBooking(id);
  }, []);

  return { addBooking, cancelBooking };
}
