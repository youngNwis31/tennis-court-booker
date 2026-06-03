import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { CourtDetailPage } from "./pages/CourtDetailPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { AuthPage } from "./pages/AuthPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ComparePage } from "./pages/ComparePage";
import { MatchmakingPage } from "./pages/MatchmakingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatBot } from "./components/ChatBot";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/court/:id" element={<CourtDetailPage />} />
              <Route path="/compare" element={<ComparePage />} />
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
            </Routes>
          </main>
          <ChatBot />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
