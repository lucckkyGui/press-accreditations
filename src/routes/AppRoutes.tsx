
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import EnhancedDashboard from "@/pages/EnhancedDashboard";
import Guests from "@/pages/Guests";
import AdvancedGuests from "@/pages/AdvancedGuests";
import Events from "@/pages/Events";
import Scanner from "@/pages/Scanner";
import SettingsPage from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import Ticketing from "@/pages/Ticketing";
import PressReleasePage from "@/pages/PressReleasePage";
import UserProfile from "@/pages/UserProfile";
import NotFound from "@/pages/NotFound";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/advanced-guests" element={<AdvancedGuests />} />
        <Route path="/events" element={<Events />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/ticketing" element={<Ticketing />} />
        <Route path="/press-releases" element={<PressReleasePage />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
