import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Toast";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { CourtDetailPage } from "./pages/CourtDetailPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { AuthPage } from "./pages/AuthPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ComparePage } from "./pages/ComparePage";
import { MatchmakingPage } from "./pages/MatchmakingPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { MapPage } from "./pages/MapPage";
import { QuizPage } from "./pages/QuizPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatBot } from "./components/ChatBot";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/court/:id" element={<CourtDetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matchmaking"
                  element={
                    <ProtectedRoute>
                      <MatchmakingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <ChatBot />
          </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
