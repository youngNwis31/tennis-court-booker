import type { Booking } from "../types";
import { supabase } from "../config/supabase";

export async function fetchCourtBookings(courtId: string, date: string): Promise<Booking[]> {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("court_id", courtId)
    .eq("date", date);
  return data ?? [];
}

export async function fetchUserBookings(userId: string): Promise<Booking[]> {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .order("start_hour", { ascending: true });
  return data ?? [];
}

export async function createBooking(userId: string, courtId: string, date: string, startHour: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from("bookings").insert({
    user_id: userId,
    court_id: courtId,
    date,
    start_hour: startHour,
  });
  return { error: error?.message ?? null };
}

export async function deleteBooking(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function isSlotAvailable(courtId: string, date: string, startHour: number): Promise<boolean> {
  const { data } = await supabase
    .from("bookings")
    .select("id")
    .eq("court_id", courtId)
    .eq("date", date)
    .eq("start_hour", startHour);
  return (data ?? []).length === 0;
}
