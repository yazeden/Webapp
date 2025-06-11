import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// --- Import Layout Components ---
import PublicLayout from "./layouts/PublicLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

// --- Import Page Components ---
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HeroSection from "./components/HeroSection.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AboutUsPage from "./pages/AboutUsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import GreenhouseDetailPage from "./pages/GreenhouseDetailPage.jsx"; // <-- NEW IMPORT

// --- Import Shared Components ---
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";


const App = () => {
  const isAuthenticated = () => {
    return !!localStorage.getItem("jwt_token");
  };

  // --- DEBUGGING LOGS (Optional, remove once everything works) ---
  console.log("--- App.jsx Render ---");
  console.log(`Current Path (from App.jsx render cycle): ${window.location.pathname}`);
  console.log(`Is Authenticated: ${isAuthenticated()}`);
  console.log("----------------------");
  // --- END DEBUGGING LOGS ---

  return (
    <div className="min-h-screen flex flex-col">
      <ErrorBoundary>
        <Routes>
          {/* Main Redirect Logic */}
          {isAuthenticated() && (
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          )}

          {/* Public Routes - Rendered if not already redirected */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HeroSection />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="about" element={<AboutUsPage />} />
          </Route>

          {/* Authenticated Routes - Protected by ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              {/* NEW ROUTE for Greenhouse Details Page */}
              <Route path="dashboard/greenhouses/:greenhouseId" element={<GreenhouseDetailPage />} /> {/* <-- NEW NESTED ROUTE */}
            </Route>
          </Route>

          {/* Optional: Fallback for unmatched routes */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;