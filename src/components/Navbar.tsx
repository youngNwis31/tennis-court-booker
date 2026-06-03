import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function Navbar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { dark, toggle } = useTheme();

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-emerald-600 text-white"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white shrink-0">
          <span>🎾</span>
          <span className="hidden sm:inline">CourtBook</span>
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto">
          <Link to="/" className={linkClass("/")}>Courts</Link>
          <Link to="/compare" className={linkClass("/compare")}>Compare</Link>
          <Link to="/map" className={linkClass("/map")}>Map</Link>
          <Link to="/quiz" className={linkClass("/quiz")}>Quiz</Link>
          {user ? (
            <>
              <Link to="/bookings" className={linkClass("/bookings")}>Bookings</Link>
              <Link to="/analytics" className={linkClass("/analytics")}>Stats</Link>
              <Link to="/matchmaking" className={linkClass("/matchmaking")}>Partners</Link>
              <Link to="/profile" className={linkClass("/profile")}>Profile</Link>
              <button
                onClick={signOut}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className={linkClass("/auth")}>Sign In</Link>
          )}
          <button
            onClick={toggle}
            className="ml-1 px-2 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );
}
