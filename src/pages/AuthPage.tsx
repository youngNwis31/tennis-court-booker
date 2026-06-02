import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Mode = "signIn" | "signUp" | "forgotPassword";

export function AuthPage() {
  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    if (mode === "forgotPassword") {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error);
      } else {
        setMessage("Check your email for a password reset link!");
        setEmail("");
      }
    } else if (mode === "signUp") {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setMessage("Check your email for a confirmation link!");
        setEmail("");
        setPassword("");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="text-center mb-8">
        <span className="text-5xl">🎾</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          {mode === "signUp"
            ? "Create an account"
            : mode === "forgotPassword"
            ? "Reset your password"
            : "Welcome back"}
        </h1>
        <p className="text-gray-500 mt-2">
          {mode === "signUp"
            ? "Sign up to start booking courts"
            : mode === "forgotPassword"
            ? "We'll send you a link to reset your password"
            : "Sign in to manage your bookings"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          onClick={signInWithGoogle}
          className="w-full py-3 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          {mode !== "forgotPassword" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="At least 6 characters"
              />
            </div>
          )}

          {mode === "signIn" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("forgotPassword")}
                className="text-sm text-emerald-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}
          {message && (
            <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? "Please wait..."
              : mode === "signUp"
              ? "Sign Up"
              : mode === "forgotPassword"
              ? "Send Reset Link"
              : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          {mode === "forgotPassword" ? (
            <>
              Remember your password?{" "}
              <button onClick={() => switchMode("signIn")} className="text-emerald-600 font-medium hover:underline">
                Sign in
              </button>
            </>
          ) : mode === "signUp" ? (
            <>
              Already have an account?{" "}
              <button onClick={() => switchMode("signIn")} className="text-emerald-600 font-medium hover:underline">
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button onClick={() => switchMode("signUp")} className="text-emerald-600 font-medium hover:underline">
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
