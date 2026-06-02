import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUserBookings } from "../hooks/useBookings";
import { courts } from "../data/courts";

export function ProfilePage() {
  const { user, updatePassword, signOut } = useAuth();
  const { bookings } = useUserBookings();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const upcomingCount = bookings.filter((b) => b.date >= today).length;
  const pastCount = bookings.filter((b) => b.date < today).length;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      setError(error);
    } else {
      setMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSubmitting(false);
  };

  const favoriteCourt = (() => {
    const counts: Record<string, number> = {};
    for (const b of bookings) {
      counts[b.court_id] = (counts[b.court_id] ?? 0) + 1;
    }
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return topId ? courts.find((c) => c.id === topId) : null;
  })();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-emerald-600">{upcomingCount}</p>
          <p className="text-sm text-gray-500 mt-1">Upcoming Bookings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-gray-700">{pastCount}</p>
          <p className="text-sm text-gray-500 mt-1">Past Bookings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl">{favoriteCourt?.emoji ?? "🎾"}</p>
          <p className="text-sm text-gray-500 mt-1">
            {favoriteCourt ? `Favorite: ${favoriteCourt.name}` : "No favorite yet"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Member since</label>
            <p className="text-gray-900">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Type your password again"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}
          {message && (
            <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3">{message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h2>
        <p className="text-sm text-gray-500 mb-4">Sign out of your account on this device.</p>
        <button
          onClick={signOut}
          className="px-6 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
