import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export function Navbar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-emerald-600 text-white"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white shrink-0">
          <span>🎾</span>
          <span className="hidden sm:inline">CourtBook</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className={linkClass("/")}>Courts</Link>
          <Link to="/map" className={linkClass("/map")}>Map</Link>
          <Link to="/quiz" className={linkClass("/quiz")}>Quiz</Link>
          <Link to="/compare" className={linkClass("/compare")}>Compare</Link>
          <Link to="/favorites" className={linkClass("/favorites")}>Favorites</Link>
          {user && (
            <>
              <Link to="/bookings" className={linkClass("/bookings")}>Bookings</Link>
              <Link to="/calendar" className={linkClass("/calendar")}>Calendar</Link>
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
          )}
          {!user && <Link to="/auth" className={linkClass("/auth")}>Sign In</Link>}
          <button
            onClick={() => setLang(lang === "en" ? "fil" : "en")}
            className="px-2 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          >
            {lang === "en" ? "🇵🇭" : "🇺🇸"}
          </button>
          <button
            onClick={toggle}
            className="px-2 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggle}
            className="px-2 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-2 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-1">
          <Link to="/" className={linkClass("/")} onClick={() => setMenuOpen(false)}>🏟️ Courts</Link>
          <Link to="/map" className={linkClass("/map")} onClick={() => setMenuOpen(false)}>🗺️ Map</Link>
          <Link to="/quiz" className={linkClass("/quiz")} onClick={() => setMenuOpen(false)}>🤖 Quiz</Link>
          <Link to="/compare" className={linkClass("/compare")} onClick={() => setMenuOpen(false)}>⚖️ Compare</Link>
          <Link to="/favorites" className={linkClass("/favorites")} onClick={() => setMenuOpen(false)}>❤️ Favorites</Link>
          {user ? (
            <>
              <Link to="/bookings" className={linkClass("/bookings")} onClick={() => setMenuOpen(false)}>📅 Bookings</Link>
              <Link to="/calendar" className={linkClass("/calendar")} onClick={() => setMenuOpen(false)}>📆 Calendar</Link>
              <Link to="/analytics" className={linkClass("/analytics")} onClick={() => setMenuOpen(false)}>📊 Stats</Link>
              <Link to="/matchmaking" className={linkClass("/matchmaking")} onClick={() => setMenuOpen(false)}>👥 Partners</Link>
              <Link to="/profile" className={linkClass("/profile")} onClick={() => setMenuOpen(false)}>👤 Profile</Link>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                🚪 Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className={linkClass("/auth")} onClick={() => setMenuOpen(false)}>🔑 Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
