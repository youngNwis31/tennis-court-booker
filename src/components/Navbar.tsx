import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-emerald-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <span>🎾</span>
          <span>CourtBook</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/" className={linkClass("/")}>
            Courts
          </Link>
          {user ? (
            <>
              <Link to="/bookings" className={linkClass("/bookings")}>
                My Bookings
              </Link>
              <span className="text-sm text-gray-400 ml-2 hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className={linkClass("/auth")}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
